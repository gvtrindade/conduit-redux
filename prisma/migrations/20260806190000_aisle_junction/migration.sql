-- CreateTable
CREATE TABLE "aisle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "squadId" TEXT NOT NULL,

    CONSTRAINT "aisle_pkey" PRIMARY KEY ("id")
);

-- Backfill: one Aisle per (squad, name) from existing merchant aisles
INSERT INTO "aisle" ("id", "name", "createdAt", "updatedAt", "squadId")
SELECT
    "gen_random_uuid"()::text AS "id",
    d."name",
    NOW() AS "createdAt",
    NOW() AS "updatedAt",
    d."squadId"
FROM (
    SELECT DISTINCT m."squadId", ma."name"
    FROM "merchant_aisle" ma
    JOIN "merchant" m ON m."id" = ma."merchantId"
) d;

-- AlterTable
ALTER TABLE "merchant_aisle" ADD COLUMN "aisleId" TEXT;

-- Backfill junction aisleId from the shared Aisle name
UPDATE "merchant_aisle" ma
SET "aisleId" = sub."aisleId"
FROM (
    SELECT r."id" AS "juncId", a."id" AS "aisleId"
    FROM "merchant_aisle" r
    JOIN "merchant" m ON m."id" = r."merchantId"
    JOIN "aisle" a ON a."squadId" = m."squadId" AND a."name" = r."name"
) sub
WHERE ma."id" = sub."juncId";

-- AlterTable
ALTER TABLE "merchant_aisle" DROP COLUMN "name",
    ALTER COLUMN "aisleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "mission_item" ADD COLUMN "squadId" TEXT;

-- Backfill squadId from the merchant of each rule
UPDATE "mission_item" mi
SET "squadId" = sub."squadId"
FROM (
    SELECT DISTINCT ON (r."missionItemId") r."missionItemId", m."squadId"
    FROM "merchant_aisle_rule" r
    JOIN "merchant" m ON m."id" = r."merchantId"
) sub
WHERE sub."missionItemId" = mi."id";

-- Fallback for any item without a rule
UPDATE "mission_item"
SET "squadId" = (SELECT "id" FROM "squad" ORDER BY "createdAt" LIMIT 1)
WHERE "squadId" IS NULL;

-- AlterTable
ALTER TABLE "mission_item" ALTER COLUMN "squadId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "merchant_aisle_merchantId_aisleId_key" ON "merchant_aisle"("merchantId", "aisleId");

-- AddForeignKey
ALTER TABLE "aisle" ADD CONSTRAINT "aisle_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "squad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_aisle" ADD CONSTRAINT "merchant_aisle_aisleId_fkey" FOREIGN KEY ("aisleId") REFERENCES "aisle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_item" ADD CONSTRAINT "mission_item_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "squad"("id") ON DELETE CASCADE ON UPDATE CASCADE;