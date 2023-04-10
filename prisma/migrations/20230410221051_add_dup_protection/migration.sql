/*
  Warnings:

  - A unique constraint covering the columns `[lat,lng]` on the table `LatLngToProcess` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lat,lng]` on the table `Place` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LatLngToProcess_lat_lng_key" ON "LatLngToProcess"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "Place_lat_lng_key" ON "Place"("lat", "lng");
