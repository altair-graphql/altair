-- CreateTable
CREATE TABLE "PlanConfig" (
    "id" TEXT NOT NULL,
    "maxQueryCount" INTEGER NOT NULL,
    "maxTeamCount" INTEGER NOT NULL,
    "maxTeamMemberCount" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanConfig_id_key" ON "PlanConfig"("id");
