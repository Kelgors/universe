/*
  Warnings:

  - You are about to drop the column `payload` on the `FederationEvent` table. All the data in the column will be lost.
  - Added the required column `message` to the `FederationEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FederationEvent" DROP COLUMN "payload",
ADD COLUMN     "message" BYTEA NOT NULL;
