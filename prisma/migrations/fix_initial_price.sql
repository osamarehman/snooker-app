-- Update null values to 0
UPDATE "Match" SET "initialPrice" = 0 WHERE "initialPrice" IS NULL; 