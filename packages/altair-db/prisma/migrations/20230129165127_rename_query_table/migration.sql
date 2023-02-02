/*
  Warnings:

  - You are about to drop the `Query` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Query" DROP CONSTRAINT "Query_collectionId_fkey";

-- DropTable
DROP TABLE "Query";

-- CreateTable
CREATE TABLE "QueryItem" (
    "id" TEXT NOT NULL,
    "queryVersion" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueryItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QueryItem" ADD CONSTRAINT "QueryItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "QueryCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
