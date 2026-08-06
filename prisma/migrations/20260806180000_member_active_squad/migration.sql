-- AlterTable
ALTER TABLE "member" ADD COLUMN     "activeSquadId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "member_activeSquadId_key" ON "member"("activeSquadId");

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_activeSquadId_fkey" FOREIGN KEY ("activeSquadId") REFERENCES "squad"("id") ON DELETE SET NULL ON UPDATE CASCADE;
