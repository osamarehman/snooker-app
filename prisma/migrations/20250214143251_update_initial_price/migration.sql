/*
  Warnings:

  - Made the column `initialPrice` on table `Match` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "initialPrice" SET NOT NULL,
ALTER COLUMN "initialPrice" SET DEFAULT 0;
