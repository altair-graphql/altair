-- AlterTable
ALTER TABLE "PlanConfig" ADD COLUMN     "queryRevisionLimit" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "QueryItemRevision" (
    "id" TEXT NOT NULL,
    "queryItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "QueryItemRevision_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QueryItemRevision" ADD CONSTRAINT "QueryItemRevision_queryItemId_fkey" FOREIGN KEY ("queryItemId") REFERENCES "QueryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryItemRevision" ADD CONSTRAINT "QueryItemRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
