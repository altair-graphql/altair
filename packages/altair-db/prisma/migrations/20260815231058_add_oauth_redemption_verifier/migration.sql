-- AlterTable
ALTER TABLE "OAuthLoginTransaction" ADD COLUMN     "redemptionVerifierHash" TEXT NOT NULL DEFAULT '';
