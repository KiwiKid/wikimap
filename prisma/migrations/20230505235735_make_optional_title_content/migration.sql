/*
  Warnings:

  - Made the column `title` on table `PlaceType` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `PlaceType` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PlaceType" ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "title" SET DEFAULT '',
ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "content" SET DEFAULT '';
