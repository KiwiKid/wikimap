/*
  Warnings:

  - Added the required column `downvotes` to the `PlaceType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upvotes` to the `PlaceType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlaceType" ADD COLUMN     "downvotes" INTEGER NULL,
ADD COLUMN     "upvotes" INTEGER NULL;
