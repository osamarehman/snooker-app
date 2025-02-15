-- First update all null values to 0
UPDATE "Match" SET "initialPrice" = 0 WHERE "initialPrice" IS NULL;

-- Then make the column required with a default value
ALTER TABLE "Match" ALTER COLUMN "initialPrice" SET NOT NULL,
                     ALTER COLUMN "initialPrice" SET DEFAULT 0; 