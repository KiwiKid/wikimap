/*
  Warnings:

  - A unique constraint covering the columns `[wiki_id,type]` on the table `PlaceType` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PlaceType_wiki_id_promptType_key";

-- CreateIndex
CREATE UNIQUE INDEX "PlaceType_wiki_id_type_key" ON "PlaceType"("wiki_id", "type");
