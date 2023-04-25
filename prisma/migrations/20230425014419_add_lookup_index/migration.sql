/*
  Warnings:

  - A unique constraint covering the columns `[wiki_id,promptType]` on the table `PlaceType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `promptType` to the `PlaceType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlaceType" ADD COLUMN     "promptType" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlaceType_wiki_id_promptType_key" ON "PlaceType"("wiki_id", "promptType");
