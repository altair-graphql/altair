-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "requestVersion" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestCollection" (
    "id" TEXT NOT NULL,

    CONSTRAINT "RequestCollection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "RequestCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
