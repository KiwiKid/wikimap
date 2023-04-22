/*
  Warnings:

  - A unique constraint covering the columns `[lat,lng]` on the table `LatLngToProcess` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "LatLngToProcess_lat_lng_key";

-- CreateIndex
CREATE UNIQUE INDEX "LatLngToProcess_lat_lng_key" ON "LatLngToProcess"("lat" DESC, "lng" DESC);
