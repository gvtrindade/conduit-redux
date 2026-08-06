-- DropTable
DROP TABLE "mission_crew";

-- AlterTable
ALTER TABLE "mission" ADD COLUMN "merchantId" TEXT;

-- AlterTable
ALTER TABLE "mission_item_est" ADD COLUMN "complete" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;