"use server";

import { prisma } from "@/lib/prisma";
import { publishSquadChange } from "@/lib/realtime";
import { orderEstimatesByAisles } from "@/lib/mission-item-ordering";

type FinalStatus = {
  estimatedTotal: number;
  completion: { completed: number; total: number };
  itemEstimates: {
    id: string;
    missionItemId: string;
    title: string;
    category: string;
    estValue: number;
    complete: boolean;
  }[];
};

export async function getMissions(userId: string, squadId: string) {
  const member = await prisma.member.findUnique({
    where: { userId },
    select: {
      squadCrews: {
        where: { squadId },
        select: { id: true },
      },
    },
  });
  if (!member?.squadCrews.length) {
    return { error: "forbidden" as const };
  }

  const missions = await prisma.mission.findMany({
    where: { squadId },
    select: {
      id: true,
      title: true,
      state: true,
      finalStatus: true,
      _count: { select: { itemEstimates: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    missions: missions.map((mission) => {
      const finalStatus = mission.finalStatus as FinalStatus | null;
      return {
        id: mission.id,
        title: mission.title,
        state: mission.state,
        _count: {
          itemEstimates: finalStatus
            ? finalStatus.itemEstimates.length
            : mission._count.itemEstimates,
        },
      };
    }),
  };
}

export async function createMission(userId: string, squadId: string) {
  const member = await prisma.member.findUnique({
    where: { userId },
    select: {
      squadCrews: {
        where: { squadId },
        select: { id: true },
      },
    },
  });
  if (!member?.squadCrews.length) {
    return { error: "forbidden" as const };
  }

  try {
    const mission = await prisma.mission.create({
      data: { squadId, title: "", state: "draft" },
      select: { id: true },
    });
    publishSquadChange(squadId, {
      type: "mission.created",
      actorId: userId,
      missionId: mission.id,
    });
    return { id: mission.id };
  } catch {
    return { error: "failed" as const };
  }
}

async function isSquadMember(userId: string, squadId: string) {
  const member = await prisma.member.findUnique({
    where: { userId },
    select: {
      squadCrews: {
        where: { squadId },
        select: { id: true },
      },
    },
  });
  return !!member?.squadCrews.length;
}

async function isMissionAccessible(
  userId: string,
  squadId: string,
  missionId: string,
) {
  if (!(await isSquadMember(userId, squadId))) {
    return false;
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: { squadId: true },
  });
  if (!mission || mission.squadId !== squadId) {
    return false;
  }

  return true;
}

export async function getMission(
  userId: string,
  squadId: string,
  missionId: string,
) {
  if (!(await isMissionAccessible(userId, squadId, missionId))) {
    return null;
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: {
      id: true,
      title: true,
      state: true,
      finalStatus: true,
      merchant: { select: { id: true, name: true } },
      itemEstimates: {
        select: {
          id: true,
          estValue: true,
          complete: true,
          missionItem: { select: { id: true, title: true, category: true } },
        },
        orderBy: [{ order: "asc" }, { missionItem: { title: "asc" } }],
      },
    },
  });
  if (!mission) {
    return null;
  }

  const finalStatus = mission.finalStatus as FinalStatus | null;
  const estimatedTotal =
    finalStatus?.estimatedTotal ??
    mission.itemEstimates.reduce((sum, estimate) => sum + estimate.estValue, 0);
  const completed =
    finalStatus?.completion.completed ??
    mission.itemEstimates.filter((estimate) => estimate.complete).length;
  const total = finalStatus?.completion.total ?? mission.itemEstimates.length;
  const itemEstimates =
    finalStatus?.itemEstimates ??
    mission.itemEstimates.map((estimate) => ({
      id: estimate.id,
      missionItemId: estimate.missionItem.id,
      title: estimate.missionItem.title,
      category: estimate.missionItem.category,
      estValue: estimate.estValue,
      complete: estimate.complete,
    }));

  return {
    id: mission.id,
    title: mission.title,
    state: mission.state,
    merchant: mission.merchant ?? null,
    estimatedTotal,
    completion: {
      completed,
      total,
    },
    itemEstimates,
  };
}

export async function renameMission(
  userId: string,
  squadId: string,
  missionId: string,
  title: string,
) {
  const trimmed = title.trim();
  if (!trimmed) {
    return { error: "required" as const };
  }

  if (!(await isMissionAccessible(userId, squadId, missionId))) {
    return { error: "forbidden" as const };
  }

  try {
    await prisma.mission.update({
      where: { id: missionId },
      data: { title: trimmed },
    });
    publishSquadChange(squadId, {
      type: "mission.updated",
      actorId: userId,
      missionId,
    });
    return { success: true };
  } catch {
    return { error: "failed" as const };
  }
}

export async function activateMission(
  userId: string,
  squadId: string,
  missionId: string,
  merchantId: string | null,
) {
  if (!(await isMissionAccessible(userId, squadId, missionId))) {
    return { error: "forbidden" as const };
  }

  if (merchantId) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { squadId: true },
    });
    if (!merchant || merchant.squadId !== squadId) {
      return { error: "invalidMerchant" as const };
    }
  }

  try {
    if (merchantId) {
      const [estimates, aisles, rules] = await Promise.all([
        prisma.missionItemEst.findMany({
          where: { missionId },
          select: {
            id: true,
            missionItem: {
              select: { id: true, title: true, aisleId: true },
            },
          },
        }),
        prisma.merchantAisle.findMany({
          where: { merchantId },
          select: { id: true, order: true, aisleId: true },
        }),
        prisma.merchantAisleRule.findMany({
          where: { merchantId },
          select: {
            missionItemId: true,
            merchantAisleId: true,
            order: true,
          },
        }),
      ]);

      const ordered = orderEstimatesByAisles(
        estimates.map((estimate) => ({
          id: estimate.id,
          missionItemId: estimate.missionItem.id,
          aisleId: estimate.missionItem.aisleId,
          title: estimate.missionItem.title,
        })),
        aisles,
        rules,
      );

      await prisma.$transaction([
        prisma.mission.update({
          where: { id: missionId },
          data: { state: "active", merchantId },
        }),
        ...ordered.map((estimate, index) =>
          prisma.missionItemEst.update({
            where: { id: estimate.id },
            data: { order: index },
          }),
        ),
      ]);
    } else {
      await prisma.mission.update({
        where: { id: missionId },
        data: { state: "active", merchantId: null },
      });
    }
    publishSquadChange(squadId, {
      type: "mission.updated",
      actorId: userId,
      missionId,
    });
    return { success: true };
  } catch {
    return { error: "failed" as const };
  }
}

export async function finishMission(
  userId: string,
  squadId: string,
  missionId: string,
) {
  if (!(await isMissionAccessible(userId, squadId, missionId))) {
    return { error: "forbidden" as const };
  }

  try {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      select: {
        itemEstimates: {
          select: {
            id: true,
            estValue: true,
            complete: true,
            missionItem: {
              select: { id: true, title: true, category: true },
            },
          },
          orderBy: [{ order: "asc" }, { missionItem: { title: "asc" } }],
        },
      },
    });
    if (!mission) {
      return { error: "failed" as const };
    }

    const estimatedTotal = mission.itemEstimates.reduce(
      (sum, estimate) => sum + estimate.estValue,
      0,
    );
    const completed = mission.itemEstimates.filter(
      (estimate) => estimate.complete,
    ).length;
    const total = mission.itemEstimates.length;

    await prisma.$transaction([
      prisma.mission.update({
        where: { id: missionId },
        data: {
          state: "finished",
          finalStatus: {
            estimatedTotal,
            completion: { completed, total },
            itemEstimates: mission.itemEstimates.map((estimate) => ({
              id: estimate.id,
              missionItemId: estimate.missionItem.id,
              title: estimate.missionItem.title,
              category: estimate.missionItem.category,
              estValue: estimate.estValue,
              complete: estimate.complete,
            })),
          },
        },
      }),
      prisma.missionItemEst.deleteMany({ where: { missionId } }),
    ]);
    publishSquadChange(squadId, {
      type: "mission.updated",
      actorId: userId,
      missionId,
    });
    return { success: true };
  } catch {
    return { error: "failed" as const };
  }
}

export async function deleteMission(
  userId: string,
  squadId: string,
  missionId: string,
) {
  if (!(await isMissionAccessible(userId, squadId, missionId))) {
    return { error: "forbidden" as const };
  }

  try {
    await prisma.mission.delete({ where: { id: missionId } });
    publishSquadChange(squadId, {
      type: "mission.deleted",
      actorId: userId,
      missionId,
    });
    return { success: true };
  } catch {
    return { error: "failed" as const };
  }
}

export async function setMissionItemComplete(
  userId: string,
  squadId: string,
  missionId: string,
  estimateId: string,
  complete: boolean,
) {
  if (!(await isMissionAccessible(userId, squadId, missionId))) {
    return { error: "forbidden" as const };
  }

  const estimate = await prisma.missionItemEst.findUnique({
    where: { id: estimateId },
    select: { missionId: true },
  });
  if (!estimate || estimate.missionId !== missionId) {
    return { error: "notFound" as const };
  }

  try {
    await prisma.missionItemEst.update({
      where: { id: estimateId },
      data: { complete },
    });
    publishSquadChange(squadId, {
      type: "mission.updated",
      actorId: userId,
      missionId,
    });
    return { success: true };
  } catch {
    return { error: "failed" as const };
  }
}

export async function removeMissionItem(
  userId: string,
  squadId: string,
  missionId: string,
  estimateId: string,
) {
  if (!(await isMissionAccessible(userId, squadId, missionId))) {
    return { error: "forbidden" as const };
  }

  const estimate = await prisma.missionItemEst.findUnique({
    where: { id: estimateId },
    select: { missionId: true },
  });
  if (!estimate || estimate.missionId !== missionId) {
    return { error: "notFound" as const };
  }

  try {
    await prisma.missionItemEst.delete({ where: { id: estimateId } });
    publishSquadChange(squadId, {
      type: "mission.updated",
      actorId: userId,
      missionId,
    });
    return { success: true };
  } catch {
    return { error: "failed" as const };
  }
}

export async function getMissionItemBank(userId: string, squadId: string) {
  if (!(await isSquadMember(userId, squadId))) {
    return { error: "forbidden" as const };
  }

  const [items, aisles] = await Promise.all([
    prisma.missionItem.findMany({
      where: { squadId },
      select: {
        id: true,
        title: true,
        category: true,
        aisleId: true,
        _count: {
          select: {
            estimates: {
              where: { mission: { state: { in: ["draft", "active"] } } },
            },
          },
        },
      },
      orderBy: { title: "asc" },
    }),
    prisma.aisle.findMany({
      where: { squadId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      aisleId: item.aisleId,
      inUse: item._count.estimates > 0,
    })),
    aisles,
  };
}

export async function createMissionItem(
  userId: string,
  squadId: string,
  title: string,
  aisleId: string | null,
) {
  const trimmed = title.trim();
  if (!trimmed) {
    return { error: "required" as const };
  }

  if (!(await isSquadMember(userId, squadId))) {
    return { error: "forbidden" as const };
  }

  let category = "";
  if (aisleId) {
    const aisle = await prisma.aisle.findUnique({
      where: { id: aisleId },
      select: { squadId: true, name: true },
    });
    if (!aisle || aisle.squadId !== squadId) {
      return { error: "invalidAisle" as const };
    }
    category = aisle.name;
  }

  try {
    const item = await prisma.missionItem.create({
      data: { squadId, title: trimmed, category, aisleId },
      select: { id: true, title: true },
    });
    publishSquadChange(squadId, {
      type: "items.updated",
      actorId: userId,
    });

    return { id: item.id, title: item.title };
  } catch {
    return { error: "failed" as const };
  }
}

export async function updateMissionItem(
  userId: string,
  squadId: string,
  missionItemId: string,
  title: string,
  aisleId: string | null,
) {
  const trimmed = title.trim();
  if (!trimmed) {
    return { error: "required" as const };
  }

  if (!(await isSquadMember(userId, squadId))) {
    return { error: "forbidden" as const };
  }

  const item = await prisma.missionItem.findUnique({
    where: { id: missionItemId },
    select: { squadId: true },
  });
  if (!item || item.squadId !== squadId) {
    return { error: "forbidden" as const };
  }

  let category: string;
  if (aisleId) {
    const aisle = await prisma.aisle.findUnique({
      where: { id: aisleId },
      select: { squadId: true, name: true },
    });
    if (!aisle || aisle.squadId !== squadId) {
      return { error: "invalidAisle" as const };
    }
    category = aisle.name;
  } else {
    category = "";
  }

  try {
    await prisma.missionItem.update({
      where: { id: missionItemId },
      data: { title: trimmed, category, aisleId },
    });
    publishSquadChange(squadId, {
      type: "items.updated",
      actorId: userId,
    });
    return { success: true };
  } catch {
    return { error: "failed" as const };
  }
}

export async function addMissionItemEstimates(
  userId: string,
  squadId: string,
  missionId: string,
  missionItemIds: string[],
) {
  if (!missionItemIds.length) {
    return { error: "required" as const };
  }

  if (!(await isMissionAccessible(userId, squadId, missionId))) {
    return { error: "forbidden" as const };
  }

  try {
    const existing = await prisma.missionItemEst.findMany({
      where: { missionId, missionItemId: { in: missionItemIds } },
      select: { missionItemId: true },
    });
    const toAdd = missionItemIds.filter(
      (id) => !existing.some((estimate) => estimate.missionItemId === id),
    );
    if (toAdd.length) {
      const missionInfo = await prisma.mission.findUnique({
        where: { id: missionId },
        select: { state: true },
      });
      const orderInfo = await prisma.missionItemEst.aggregate({
        where: { missionId },
        _max: { order: true },
      });
      const startOrder =
        missionInfo?.state === "active" ? (orderInfo._max.order ?? -1) + 1 : 0;
      await prisma.missionItemEst.createMany({
        data: toAdd.map((missionItemId, index) => ({
          missionId,
          missionItemId,
          estValue: 0,
          order: startOrder + index,
        })),
      });
    }
    publishSquadChange(squadId, {
      type: "mission.updated",
      actorId: userId,
      missionId,
    });
    return { success: true };
  } catch {
    return { error: "failed" as const };
  }
}

export async function deleteMissionItem(
  userId: string,
  squadId: string,
  missionItemId: string,
) {
  if (!(await isSquadMember(userId, squadId))) {
    return { error: "forbidden" as const };
  }

  const item = await prisma.missionItem.findUnique({
    where: { id: missionItemId },
    select: {
      squadId: true,
      _count: {
        select: {
          estimates: {
            where: { mission: { state: { in: ["draft", "active"] } } },
          },
        },
      },
    },
  });
  if (!item || item.squadId !== squadId) {
    return { error: "forbidden" as const };
  }
  if (item._count.estimates > 0) {
    return { error: "inUse" as const };
  }

  try {
    await prisma.$transaction([
      prisma.merchantAisleRule.deleteMany({ where: { missionItemId } }),
      prisma.missionItem.delete({ where: { id: missionItemId } }),
    ]);
    publishSquadChange(squadId, {
      type: "items.updated",
      actorId: userId,
    });
    return { success: true };
  } catch {
    return { error: "failed" as const };
  }
}
