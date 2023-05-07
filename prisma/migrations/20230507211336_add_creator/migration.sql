/*
  Warnings:

  - Added the required column `creator_id` to the `PlaceType` table without a default value. This is not possible if the table is not empty.

*/

TRUNCATE TABLE "PlaceType";
-- AlterTable
ALTER TABLE "PlaceType" ADD COLUMN     "creator_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_displayName_key" ON "User"("displayName");

-- AddForeignKey
ALTER TABLE "PlaceType" ADD CONSTRAINT "PlaceType_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
