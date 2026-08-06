-- AlterTable
ALTER TABLE "mission_item" ADD COLUMN     "aisleId" TEXT;

-- AddForeignKey
ALTER TABLE "mission_item" ADD CONSTRAINT "mission_item_aisleId_fkey" FOREIGN KEY ("aisleId") REFERENCES "aisle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
