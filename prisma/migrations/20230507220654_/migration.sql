/*
  Warnings:

  - You are about to drop the column `creator_id` on the `PlaceType` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlaceType" DROP CONSTRAINT "PlaceType_creator_id_fkey";

-- AlterTable
ALTER TABLE "PlaceType" DROP COLUMN "creator_id";

-- DropTable
DROP TABLE "User";
