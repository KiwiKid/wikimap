/*
  Warnings:

  - Made the column `downvotes` on table `PlaceType` required. This step will fail if there are existing NULL values in that column.
  - Made the column `upvotes` on table `PlaceType` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PlaceType" ALTER COLUMN "downvotes" SET NOT NULL,
ALTER COLUMN "upvotes" SET NOT NULL;
