/*
  Warnings:

  - You are about to drop the `Request` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestCollection` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TeamMemberRole" AS ENUM ('ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "RequestCollection" DROP CONSTRAINT "RequestCollection_parentCollectionId_fkey";

-- DropForeignKey
ALTER TABLE "RequestCollection" DROP CONSTRAINT "RequestCollection_workspaceId_fkey";

-- DropTable
DROP TABLE "Request";

-- DropTable
DROP TABLE "RequestCollection";

-- CreateTable
CREATE TABLE "Query" (
    "id" TEXT NOT NULL,
    "queryVersion" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "preRequestScript" TEXT,
    "preRequestScriptEnabled" BOOLEAN NOT NULL DEFAULT true,
    "postRequestScript" TEXT,
    "postRequestScriptEnabled" BOOLEAN NOT NULL DEFAULT true,
    "workspaceId" TEXT NOT NULL,
    "parentCollectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueryCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" "TeamMemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("userId","teamId")
);

-- AddForeignKey
ALTER TABLE "Query" ADD CONSTRAINT "Query_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "QueryCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryCollection" ADD CONSTRAINT "QueryCollection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryCollection" ADD CONSTRAINT "QueryCollection_parentCollectionId_fkey" FOREIGN KEY ("parentCollectionId") REFERENCES "QueryCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
