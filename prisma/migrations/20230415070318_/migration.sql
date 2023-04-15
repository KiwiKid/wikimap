/*
  Warnings:

  - You are about to drop the column `placeId` on the `PlaceType` table. All the data in the column will be lost.
  - Added the required column `wiki_id` to the `PlaceType` table without a default value. This is not possible if the table is not empty.

*/

TRUNCATE TABLE "PlaceType";
-- AlterTable
ALTER TABLE "PlaceType" DROP COLUMN "placeId",
ADD COLUMN     "wiki_id" TEXT NOT NULL;
