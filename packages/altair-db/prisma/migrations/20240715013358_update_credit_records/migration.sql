/*
  Warnings:

  - You are about to drop the column `stripeChargeId` on the `CreditPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `CreditTransaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `CreditPurchase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currency` to the `CreditPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeSessionId` to the `CreditPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `CreditPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fixedAmount` to the `CreditTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyAmount` to the `CreditTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CreditTransactionType" ADD VALUE 'DOWNGRADED';

-- AlterTable
ALTER TABLE "CreditPurchase" DROP COLUMN "stripeChargeId",
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "stripeSessionId" TEXT NOT NULL,
ADD COLUMN     "transactionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CreditTransaction" DROP COLUMN "amount",
ADD COLUMN     "fixedAmount" INTEGER NOT NULL,
ADD COLUMN     "monthlyAmount" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CreditPurchase_transactionId_key" ON "CreditPurchase"("transactionId");

-- AddForeignKey
ALTER TABLE "CreditPurchase" ADD CONSTRAINT "CreditPurchase_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "CreditTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
