-- AlterTable
ALTER TABLE "QueryCollection" ADD COLUMN     "headers" JSONB DEFAULT '[]',
ADD COLUMN     "environmentVariables" JSONB DEFAULT '{}';
