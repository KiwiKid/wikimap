/*
  Warnings:

  - A unique constraint covering the columns `[wiki_id]` on the table `Place` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Place_wiki_id_key" ON "Place"("wiki_id");

-- AddForeignKey
ALTER TABLE "PlaceType" ADD CONSTRAINT "PlaceType_wiki_id_fkey" FOREIGN KEY ("wiki_id") REFERENCES "Place"("wiki_id") ON DELETE RESTRICT ON UPDATE CASCADE;
