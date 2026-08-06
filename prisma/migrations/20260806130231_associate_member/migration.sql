/*
  Warnings:

  - You are about to drop the column `userId` on the `mission_crew` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `receipt` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `squad_crew` table. All the data in the column will be lost.
  - Added the required column `memberId` to the `mission_crew` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `squad_crew` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "mission_crew" DROP CONSTRAINT "mission_crew_userId_fkey";

-- DropForeignKey
ALTER TABLE "receipt" DROP CONSTRAINT "receipt_userId_fkey";

-- DropForeignKey
ALTER TABLE "squad" DROP CONSTRAINT "squad_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "squad_crew" DROP CONSTRAINT "squad_crew_userId_fkey";

-- AlterTable
ALTER TABLE "mission_crew" DROP COLUMN "userId",
ADD COLUMN     "memberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "receipt" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "squad_crew" DROP COLUMN "userId",
ADD COLUMN     "memberId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "squad" ADD CONSTRAINT "squad_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_crew" ADD CONSTRAINT "squad_crew_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_crew" ADD CONSTRAINT "mission_crew_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
