-- CreateTable
CREATE TABLE "OAuthLoginTransaction" (
    "id" TEXT NOT NULL,
    "provider" "IdentityProvider" NOT NULL,
    "redirectUrl" TEXT NOT NULL,
    "stateHash" TEXT NOT NULL,
    "browserBindingHash" TEXT NOT NULL,
    "handoffCodeHash" TEXT,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthLoginTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthLoginTransaction_stateHash_key" ON "OAuthLoginTransaction"("stateHash");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthLoginTransaction_handoffCodeHash_key" ON "OAuthLoginTransaction"("handoffCodeHash");

-- CreateIndex
CREATE INDEX "OAuthLoginTransaction_expiresAt_idx" ON "OAuthLoginTransaction"("expiresAt");
