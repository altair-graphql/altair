-- CreateIndex
CREATE INDEX "OAuthLoginTransaction_userId_idx" ON "OAuthLoginTransaction"("userId");

-- AddForeignKey
ALTER TABLE "OAuthLoginTransaction" ADD CONSTRAINT "OAuthLoginTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
