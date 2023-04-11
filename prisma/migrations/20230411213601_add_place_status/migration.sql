/*
  Warnings:

  - Added the required column `status` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generatedTitle" TEXT,
    "status" TEXT NOT NULL,
    "wikiUrl" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL
);
INSERT INTO "new_Place" ("generatedTitle", "id", "lat", "lng", "wikiUrl") SELECT "generatedTitle", "id", "lat", "lng", "wikiUrl" FROM "Place";
DROP TABLE "Place";
ALTER TABLE "new_Place" RENAME TO "Place";
CREATE UNIQUE INDEX "Place_lat_lng_key" ON "Place"("lat", "lng");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
