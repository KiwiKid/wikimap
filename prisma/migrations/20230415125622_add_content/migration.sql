/*
  Warnings:

  - Added the required column `content` to the `PlaceType` table without a default value. This is not possible if the table is not empty.

*/

TRUNCATE TABLE "PlaceType";
-- AlterTable
ALTER TABLE "PlaceType" ADD COLUMN     "content" TEXT NOT NULL;
