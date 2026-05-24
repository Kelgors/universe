/*
  Warnings:

  - Changed the type of `payload` on the `FederationEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `signature` on the `FederationEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `snapshot` to the `FederationPlayerTransfer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FederationEvent" DROP COLUMN "payload",
ADD COLUMN     "payload" BYTEA NOT NULL,
DROP COLUMN "signature",
ADD COLUMN     "signature" BYTEA NOT NULL;

-- AlterTable
ALTER TABLE "FederationPlayerTransfer" DROP COLUMN "snapshot",
ADD COLUMN     "snapshot" BYTEA NOT NULL;
