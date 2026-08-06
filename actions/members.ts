"use server";

import { prisma } from "@/lib/prisma";

export async function getCallsign(userId: string) {
    const callsign = await prisma.member.findUnique({
        where: { userId },
        select: {
            callsign: true
        }
    })

    return callsign;
}

export async function getMemberPreferences(userId: string) {
    return prisma.member.findUnique({
        where: { userId },
        select: {
            id: true,
            callsign: true,
            active: true,
            customConfig: true,
        },
    });
}

export async function isCallsignTaken(callsign: string, excludeUserId?: string) {
    if (!callsign.trim()) return false;

    const member = await prisma.member.findUnique({
        where: { callsign: callsign.trim() },
        select: { userId: true },
    });

    return member ? member.userId !== excludeUserId : false;
}

export async function callsignExists(callsign: string) {
    if (!callsign.trim()) return false;

    const member = await prisma.member.findUnique({
        where: { callsign: callsign.trim() },
        select: { id: true },
    });

    return !!member;
}

export async function getSquads(userId: string) {
    const member = await prisma.member.findUnique({
        where: { userId },
        select: {
            id: true,
            squadCrews: {
                select: {
                    squad: {
                        select: {
                            id: true,
                            name: true,
                            creatorId: true,
                        },
                    },
                },
            },
        },
    });

    return (
        member?.squadCrews.map(({ squad }) => ({
            ...squad,
            isCreator: squad.creatorId === member.id,
        })) ?? []
    );
}

export async function getActiveSquad(userId: string) {
    return prisma.member.findUnique({
        where: { userId },
        select: {
            activeSquad: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}

export async function setActiveSquad(userId: string, squadId: string) {
    const member = await prisma.member.findUnique({
        where: { userId },
        select: {
            id: true,
            squadCrews: {
                where: { squadId },
                select: { squadId: true },
            },
        },
    });
    if (!member?.squadCrews.length) {
        return { error: "forbidden" as const };
    }

    try {
        await prisma.member.update({
            where: { userId },
            data: { activeSquadId: squadId },
        });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function isSquadNameTaken(
    userId: string,
    name: string,
    excludeSquadId?: string,
) {
    const trimmed = name.trim();
    if (!trimmed) return false;

    const member = await prisma.member.findUnique({
        where: { userId },
        select: {
            squadCrews: {
                select: {
                    squad: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });

    return (
        member?.squadCrews.some(
            (crew) =>
                crew.squad.id !== excludeSquadId &&
                crew.squad.name?.trim().toLowerCase() === trimmed.toLowerCase(),
        ) ?? false
    );
}

export async function createSquad(userId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
        return { error: "required" as const };
    }

    if (await isSquadNameTaken(userId, trimmed)) {
        return { error: "taken" as const };
    }

    const member = await prisma.member.findUnique({
        where: { userId },
        select: { id: true },
    });
    if (!member) {
        return { error: "failed" as const };
    }

    try {
        await prisma.squad.create({
            data: {
                name: trimmed,
                creatorId: member.id,
                crew: {
                    create: { memberId: member.id },
                },
            },
        });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function renameSquad(
    userId: string,
    squadId: string,
    name: string,
) {
    const trimmed = name.trim();
    if (!trimmed) {
        return { error: "required" as const };
    }

    if (await isSquadNameTaken(userId, trimmed, squadId)) {
        return { error: "taken" as const };
    }

    try {
        await prisma.squad.update({
            where: { id: squadId },
            data: { name: trimmed },
        });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function deleteSquad(userId: string, squadId: string) {
    const member = await prisma.member.findUnique({
        where: { userId },
        select: { id: true },
    });
    if (!member) {
        return { error: "failed" as const };
    }

    const squad = await prisma.squad.findUnique({
        where: { id: squadId },
        select: { creatorId: true },
    });
    if (squad?.creatorId !== member.id) {
        return { error: "forbidden" as const };
    }

    const squadCount = await prisma.squadCrew.count({
        where: { memberId: member.id },
    });
    if (squadCount <= 1) {
        return { error: "onlySquad" as const };
    }

    try {
        await prisma.$transaction([
            prisma.member.updateMany({
                where: { activeSquadId: squadId },
                data: { activeSquadId: null },
            }),
            prisma.squad.delete({ where: { id: squadId } }),
        ]);
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function leaveSquad(userId: string, squadId: string) {
    const member = await prisma.member.findUnique({
        where: { userId },
        select: {
            id: true,
            squadCrews: {
                where: { squadId },
                select: {
                    id: true,
                    squad: { select: { creatorId: true } },
                },
            },
        },
    });
    const crew = member?.squadCrews[0];
    if (!crew) {
        return { error: "failed" as const };
    }
    if (crew.squad.creatorId === member!.id) {
        return { error: "creator" as const };
    }

    const squadCount = await prisma.squadCrew.count({
        where: { memberId: member!.id },
    });
    if (squadCount <= 1) {
        return { error: "onlySquad" as const };
    }

    try {
        await prisma.squadCrew.delete({ where: { id: crew.id } });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function setCallsign(userId: string, callsign: string) {
    const trimmed = callsign.trim();
    if (!trimmed) {
        return { error: "Callsign is required" };
    }

    if (await isCallsignTaken(trimmed, userId)) {
        return { error: "Callsign is already in use" };
    }

    try {
        await prisma.member.update({
            where: { userId },
            data: { callsign: trimmed },
        });
        return { success: true };
    } catch {
        return { error: "Failed to set callsign" };
    }
}

export async function getCrew(userId: string, squadId: string) {
    const member = await prisma.member.findUnique({
        where: { userId },
        select: {
            id: true,
            squadCrews: {
                where: { squadId },
                select: {
                    squad: {
                        select: {
                            creatorId: true,
                            crew: {
                                select: {
                                    member: {
                                        select: {
                                            id: true,
                                            callsign: true,
                                        },
                                    },
                                },
                            },
                            crewInvites: {
                                select: {
                                    id: true,
                                    member: {
                                        select: {
                                            id: true,
                                            callsign: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const squad = member?.squadCrews[0]?.squad;
    if (!squad) return null;

    return {
        isCreator: squad.creatorId === member!.id,
        crew: squad.crew.map(({ member }) => ({
            memberId: member.id,
            callsign: member.callsign ?? "???",
        })),
        invites: squad.crewInvites.map((invite) => ({
            inviteId: invite.id,
            callsign: invite.member.callsign ?? "???",
        })),
    };
}

export async function getCrewInvites(userId: string) {
    const member = await prisma.member.findUnique({
        where: { userId },
        select: { id: true },
    });
    if (!member) return [];

    return prisma.squadCrewInvite.findMany({
        where: { memberId: member.id },
        select: {
            id: true,
            squad: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}

export async function inviteToCrew(userId: string, squadId: string, callsign: string) {
    const trimmed = callsign.trim();
    if (!trimmed) {
        return { error: "required" as const };
    }

    const member = await prisma.member.findUnique({
        where: { userId },
        select: {
            id: true,
            squadCrews: {
                where: { squadId },
                select: { id: true },
            },
        },
    });
    if (!member?.squadCrews.length) {
        return { error: "forbidden" as const };
    }

    const invitee = await prisma.member.findUnique({
        where: { callsign: trimmed },
        select: { id: true },
    });
    if (!invitee) {
        return { error: "notFound" as const };
    }
    if (invitee.id === member.id) {
        return { error: "self" as const };
    }

    const existingCrew = await prisma.squadCrew.findFirst({
        where: { squadId, memberId: invitee.id },
        select: { id: true },
    });
    if (existingCrew) {
        return { error: "alreadyCrew" as const };
    }

    try {
        await prisma.squadCrewInvite.create({
            data: { squadId, memberId: invitee.id },
        });
        return { success: true };
    } catch {
        return { error: "alreadyInvited" as const };
    }
}

export async function cancelCrewInvite(userId: string, squadId: string, inviteId: string) {
    const member = await prisma.member.findUnique({
        where: { userId },
        select: {
            id: true,
            squadCrews: {
                where: { squadId },
                select: { id: true },
            },
        },
    });
    if (!member?.squadCrews.length) {
        return { error: "forbidden" as const };
    }

    const invite = await prisma.squadCrewInvite.findUnique({
        where: { id: inviteId },
        select: { squadId: true },
    });
    if (!invite || invite.squadId !== squadId) {
        return { error: "forbidden" as const };
    }

    try {
        await prisma.squadCrewInvite.delete({
            where: { id: inviteId },
        });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function acceptCrewInvite(userId: string, inviteId: string) {
    const member = await prisma.member.findUnique({
        where: { userId },
        select: { id: true },
    });
    if (!member) {
        return { error: "failed" as const };
    }

    const invite = await prisma.squadCrewInvite.findUnique({
        where: { id: inviteId },
        select: { squadId: true, memberId: true },
    });
    if (!invite || invite.memberId !== member.id) {
        return { error: "forbidden" as const };
    }

    const existingCrew = await prisma.squadCrew.findFirst({
        where: { squadId: invite.squadId, memberId: invite.memberId },
        select: { id: true },
    });

    try {
        await prisma.$transaction([
            ...(existingCrew
                ? []
                : [
                      prisma.squadCrew.create({
                          data: {
                              squadId: invite.squadId,
                              memberId: invite.memberId,
                          },
                      }),
                  ]),
            prisma.squadCrewInvite.delete({ where: { id: inviteId } }),
        ]);
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function declineCrewInvite(userId: string, inviteId: string) {
    const member = await prisma.member.findUnique({
        where: { userId },
        select: { id: true },
    });
    if (!member) {
        return { error: "failed" as const };
    }

    const invite = await prisma.squadCrewInvite.findUnique({
        where: { id: inviteId },
        select: { memberId: true },
    });
    if (!invite || invite.memberId !== member.id) {
        return { error: "forbidden" as const };
    }

    try {
        await prisma.squadCrewInvite.delete({
            where: { id: inviteId },
        });
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}

export async function removeFromCrew(userId: string, squadId: string, memberId: string) {
    const member = await prisma.member.findUnique({
        where: { userId },
        select: {
            id: true,
            squadCrews: {
                where: { squadId },
                select: {
                    squad: { select: { creatorId: true } },
                },
            },
        },
    });
    const squad = member?.squadCrews[0]?.squad;
    if (!squad || squad.creatorId !== member!.id) {
        return { error: "forbidden" as const };
    }
    if (memberId === member!.id) {
        return { error: "self" as const };
    }

    const crew = await prisma.squadCrew.findFirst({
        where: { squadId, memberId },
        select: { id: true },
    });
    if (!crew) {
        return { error: "notCrew" as const };
    }

    try {
        await prisma.$transaction([
            prisma.member.updateMany({
                where: { id: memberId, activeSquadId: squadId },
                data: { activeSquadId: null },
            }),
            prisma.squadCrew.delete({ where: { id: crew.id } }),
            prisma.squadCrewInvite.deleteMany({ where: { squadId, memberId } }),
        ]);
        return { success: true };
    } catch {
        return { error: "failed" as const };
    }
}
