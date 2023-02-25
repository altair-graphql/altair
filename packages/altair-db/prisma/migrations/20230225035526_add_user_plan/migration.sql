/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `allowMoreTeamMembers` to the `PlanConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlanConfig" ADD COLUMN     "allowMoreTeamMembers" BOOLEAN NOT NULL,
ADD COLUMN     "stripeProductId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "UserPlan" (
    "userId" TEXT NOT NULL,
    "planRole" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPlan_userId_key" ON "UserPlan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "UserPlan" ADD CONSTRAINT "UserPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlan" ADD CONSTRAINT "UserPlan_planRole_fkey" FOREIGN KEY ("planRole") REFERENCES "PlanConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
