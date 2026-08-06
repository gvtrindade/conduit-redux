-- CreateTable
CREATE TABLE "squad_crew_invite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "squadId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "squad_crew_invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "squad_crew_invite_squadId_memberId_key" ON "squad_crew_invite"("squadId", "memberId");

-- AddForeignKey
ALTER TABLE "squad_crew_invite" ADD CONSTRAINT "squad_crew_invite_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "squad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_crew_invite" ADD CONSTRAINT "squad_crew_invite_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
