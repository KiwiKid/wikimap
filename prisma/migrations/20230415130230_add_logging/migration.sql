/*
  Warnings:

  - Added the required column `raw_response` to the `PlaceType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlaceType" ADD COLUMN     "raw_response" TEXT NOT NULL;
