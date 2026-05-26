-- CreateEnum
CREATE TYPE "FederationPlayerTransferState" AS ENUM ('WAITING_TARGET_APPROVAL', 'APPROVED_BY_TARGET', 'SNAPSHOT_SENT_TO_TARGET', 'SNAPSHOT_STAGED_BY_TARGET', 'COMMIT_SENT_TO_TARGET', 'ACTIVE', 'REJECTED_BY_TARGET_AT_INIT', 'REJECTED_BY_TARGET_AT_SNAPSHOT', 'ABORTED_BY_SOURCE', 'ABORTED_BY_TARGET', 'EXPIRED');

-- CreateTable
CREATE TABLE "FederationPlayerTransfer" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "state" "FederationPlayerTransferState" NOT NULL,
    "sourceSystemId" TEXT NOT NULL,
    "targetSystemId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FederationPlayerTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FederationEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FederationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FederationPlayerTransfer_requestId_key" ON "FederationPlayerTransfer"("requestId");
