"use server";

import { prisma } from "@/lib/prisma";

export async function getMerchants(userId: string, squadId: string) {
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

    const merchants = await prisma.merchant.findMany({
        where: { squadId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    return { merchants };
}

export async function createMerchant(userId: string, squadId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
        return { error: "required" as const };
    }

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
        await prisma.merchant.create({
            data: { squadId, name: trimmed },
        });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function getMerchant(userId: string, squadId: string, merchantId: string) {
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
        return null;
    }

    const merchant = await prisma.merchant.findUnique({
        where: { id: merchantId },
        select: { id: true, name: true, squadId: true },
    });
    if (!merchant || merchant.squadId !== squadId) {
        return null;
    }

    return merchant;
}

export async function renameMerchant(
    userId: string,
    squadId: string,
    merchantId: string,
    name: string,
) {
    const trimmed = name.trim();
    if (!trimmed) {
        return { error: "required" as const };
    }

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

    const merchant = await prisma.merchant.findUnique({
        where: { id: merchantId },
        select: { squadId: true },
    });
    if (!merchant || merchant.squadId !== squadId) {
        return { error: "forbidden" as const };
    }

    try {
        await prisma.merchant.update({
            where: { id: merchantId },
            data: { name: trimmed },
        });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

async function isMerchantAccessible(
    userId: string,
    squadId: string,
    merchantId: string,
) {
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
        return false;
    }

    const merchant = await prisma.merchant.findUnique({
        where: { id: merchantId },
        select: { squadId: true },
    });
    if (!merchant || merchant.squadId !== squadId) {
        return false;
    }

    return true;
}

export async function getAisles(
    userId: string,
    squadId: string,
    merchantId: string,
) {
    if (!(await isMerchantAccessible(userId, squadId, merchantId))) {
        return { error: "forbidden" as const };
    }

    const aisles = await prisma.merchantAisle.findMany({
        where: { merchantId },
        select: { id: true, name: true, order: true },
        orderBy: { order: "asc" },
    });

    return { aisles };
}

export async function createAisle(
    userId: string,
    squadId: string,
    merchantId: string,
    name: string,
) {
    const trimmed = name.trim();
    if (!trimmed) {
        return { error: "required" as const };
    }

    if (!(await isMerchantAccessible(userId, squadId, merchantId))) {
        return { error: "forbidden" as const };
    }

    try {
        const last = await prisma.merchantAisle.findFirst({
            where: { merchantId },
            orderBy: { order: "desc" },
            select: { order: true },
        });
        await prisma.merchantAisle.create({
            data: { merchantId, name: trimmed, order: (last?.order ?? -1) + 1 },
        });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function renameAisle(
    userId: string,
    squadId: string,
    merchantId: string,
    aisleId: string,
    name: string,
) {
    const trimmed = name.trim();
    if (!trimmed) {
        return { error: "required" as const };
    }

    if (!(await isMerchantAccessible(userId, squadId, merchantId))) {
        return { error: "forbidden" as const };
    }

    const aisle = await prisma.merchantAisle.findUnique({
        where: { id: aisleId },
        select: { merchantId: true },
    });
    if (!aisle || aisle.merchantId !== merchantId) {
        return { error: "notFound" as const };
    }

    try {
        await prisma.merchantAisle.update({
            where: { id: aisleId },
            data: { name: trimmed },
        });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function deleteAisle(
    userId: string,
    squadId: string,
    merchantId: string,
    aisleId: string,
) {
    if (!(await isMerchantAccessible(userId, squadId, merchantId))) {
        return { error: "forbidden" as const };
    }

    const aisle = await prisma.merchantAisle.findUnique({
        where: { id: aisleId },
        select: { merchantId: true },
    });
    if (!aisle || aisle.merchantId !== merchantId) {
        return { error: "notFound" as const };
    }

    try {
        await prisma.merchantAisle.delete({
            where: { id: aisleId },
        });

        const aisles = await prisma.merchantAisle.findMany({
            where: { merchantId },
            orderBy: { order: "asc" },
            select: { id: true },
        });
        await prisma.$transaction(
            aisles.map((a, index) =>
                prisma.merchantAisle.update({
                    where: { id: a.id },
                    data: { order: index },
                }),
            ),
        );

        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function moveAisle(
    userId: string,
    squadId: string,
    merchantId: string,
    aisleId: string,
    direction: "up" | "down",
) {
    if (!(await isMerchantAccessible(userId, squadId, merchantId))) {
        return { error: "forbidden" as const };
    }

    const aisles = await prisma.merchantAisle.findMany({
        where: { merchantId },
        orderBy: { order: "asc" },
        select: { id: true, order: true },
    });

    const index = aisles.findIndex((a) => a.id === aisleId);
    if (index === -1) {
        return { error: "notFound" as const };
    }

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= aisles.length) {
        return { success: true };
    }

    try {
        await prisma.$transaction([
            prisma.merchantAisle.update({
                where: { id: aisles[index].id },
                data: { order: aisles[target].order },
            }),
            prisma.merchantAisle.update({
                where: { id: aisles[target].id },
                data: { order: aisles[index].order },
            }),
        ]);
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function getAisleRules(
    userId: string,
    squadId: string,
    merchantId: string,
) {
    if (!(await isMerchantAccessible(userId, squadId, merchantId))) {
        return { error: "forbidden" as const };
    }

    const rules = await prisma.merchantAisleRule.findMany({
        where: { merchantId },
        orderBy: { order: "asc" },
        select: {
            id: true,
            order: true,
            missionItem: { select: { id: true, title: true } },
            merchantAisle: { select: { id: true, name: true } },
        },
    });

    return { rules };
}

export async function getMissionItems() {
    const items = await prisma.missionItem.findMany({
        select: { id: true, title: true },
        orderBy: { title: "asc" },
    });

    return { items };
}

export async function createAisleRule(
    userId: string,
    squadId: string,
    merchantId: string,
    missionItemId: string,
    merchantAisleId: string,
) {
    if (!missionItemId || !merchantAisleId) {
        return { error: "required" as const };
    }

    if (!(await isMerchantAccessible(userId, squadId, merchantId))) {
        return { error: "forbidden" as const };
    }

    const aisle = await prisma.merchantAisle.findUnique({
        where: { id: merchantAisleId },
        select: { merchantId: true },
    });
    if (!aisle || aisle.merchantId !== merchantId) {
        return { error: "invalidAisle" as const };
    }

    const missionItem = await prisma.missionItem.findUnique({
        where: { id: missionItemId },
        select: { id: true },
    });
    if (!missionItem) {
        return { error: "invalidMissionItem" as const };
    }

    const duplicate = await prisma.merchantAisleRule.findFirst({
        where: { merchantId, missionItemId, merchantAisleId },
        select: { id: true },
    });
    if (duplicate) {
        return { error: "duplicate" as const };
    }

    try {
        const last = await prisma.merchantAisleRule.findFirst({
            where: { merchantId },
            orderBy: { order: "desc" },
            select: { order: true },
        });
        await prisma.merchantAisleRule.create({
            data: {
                merchantId,
                missionItemId,
                merchantAisleId,
                order: (last?.order ?? -1) + 1,
            },
        });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function updateAisleRule(
    userId: string,
    squadId: string,
    merchantId: string,
    ruleId: string,
    missionItemId: string,
    merchantAisleId: string,
) {
    if (!missionItemId || !merchantAisleId) {
        return { error: "required" as const };
    }

    if (!(await isMerchantAccessible(userId, squadId, merchantId))) {
        return { error: "forbidden" as const };
    }

    const rule = await prisma.merchantAisleRule.findUnique({
        where: { id: ruleId },
        select: { merchantId: true },
    });
    if (!rule || rule.merchantId !== merchantId) {
        return { error: "notFound" as const };
    }

    const aisle = await prisma.merchantAisle.findUnique({
        where: { id: merchantAisleId },
        select: { merchantId: true },
    });
    if (!aisle || aisle.merchantId !== merchantId) {
        return { error: "invalidAisle" as const };
    }

    const missionItem = await prisma.missionItem.findUnique({
        where: { id: missionItemId },
        select: { id: true },
    });
    if (!missionItem) {
        return { error: "invalidMissionItem" as const };
    }

    const duplicate = await prisma.merchantAisleRule.findFirst({
        where: {
            merchantId,
            missionItemId,
            merchantAisleId,
            id: { not: ruleId },
        },
        select: { id: true },
    });
    if (duplicate) {
        return { error: "duplicate" as const };
    }

    try {
        await prisma.merchantAisleRule.update({
            where: { id: ruleId },
            data: { missionItemId, merchantAisleId },
        });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function deleteAisleRule(
    userId: string,
    squadId: string,
    merchantId: string,
    ruleId: string,
) {
    if (!(await isMerchantAccessible(userId, squadId, merchantId))) {
        return { error: "forbidden" as const };
    }

    const rule = await prisma.merchantAisleRule.findUnique({
        where: { id: ruleId },
        select: { merchantId: true },
    });
    if (!rule || rule.merchantId !== merchantId) {
        return { error: "notFound" as const };
    }

    try {
        await prisma.merchantAisleRule.delete({
            where: { id: ruleId },
        });

        const rules = await prisma.merchantAisleRule.findMany({
            where: { merchantId },
            orderBy: { order: "asc" },
            select: { id: true },
        });
        await prisma.$transaction(
            rules.map((r, index) =>
                prisma.merchantAisleRule.update({
                    where: { id: r.id },
                    data: { order: index },
                }),
            ),
        );

        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function moveAisleRule(
    userId: string,
    squadId: string,
    merchantId: string,
    ruleId: string,
    direction: "up" | "down",
) {
    if (!(await isMerchantAccessible(userId, squadId, merchantId))) {
        return { error: "forbidden" as const };
    }

    const rules = await prisma.merchantAisleRule.findMany({
        where: { merchantId },
        orderBy: { order: "asc" },
        select: { id: true, order: true },
    });

    const index = rules.findIndex((r) => r.id === ruleId);
    if (index === -1) {
        return { error: "notFound" as const };
    }

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= rules.length) {
        return { success: true };
    }

    try {
        await prisma.$transaction([
            prisma.merchantAisleRule.update({
                where: { id: rules[index].id },
                data: { order: rules[target].order },
            }),
            prisma.merchantAisleRule.update({
                where: { id: rules[target].id },
                data: { order: rules[index].order },
            }),
        ]);
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function getMerchantReceipts(
    userId: string,
    squadId: string,
    merchantId: string,
) {
    if (!(await isMerchantAccessible(userId, squadId, merchantId))) {
        return { error: "forbidden" as const };
    }

    const receipts = await prisma.receipt.findMany({
        where: { merchantId },
        select: { id: true, date: true, status: true, nfce: true },
        orderBy: { date: "desc" },
    });

    return { receipts };
}