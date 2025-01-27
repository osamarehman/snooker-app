/*
  Warnings:

  - You are about to drop the column `dueFees` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `totalTime` on the `Match` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ExpenseTag" AS ENUM ('FOOD', 'MAINTENANCE', 'UTILITIES', 'SALARY', 'OTHER');

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "dueFees",
DROP COLUMN "totalTime",
ADD COLUMN     "timeMinutes" INTEGER,
ALTER COLUMN "format" DROP DEFAULT,
ALTER COLUMN "initialPrice" DROP NOT NULL,
ALTER COLUMN "paymentMethod" SET DEFAULT 'CASH',
ALTER COLUMN "status" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tag" "ExpenseTag" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Match_tableId_idx" ON "Match"("tableId");
