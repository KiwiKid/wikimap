/*
  Warnings:

  - You are about to alter the column `lat` on the `LatLngToProcess` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `lng` on the `LatLngToProcess` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `lat` on the `Place` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `lng` on the `Place` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LatLngToProcess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LatLngToProcess" ("createdAt", "id", "lat", "lng", "status", "updatedAt") SELECT "createdAt", "id", "lat", "lng", "status", "updatedAt" FROM "LatLngToProcess";
DROP TABLE "LatLngToProcess";
ALTER TABLE "new_LatLngToProcess" RENAME TO "LatLngToProcess";
CREATE TABLE "new_Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generatedTitle" TEXT NOT NULL,
    "wikiUrl" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL
);
INSERT INTO "new_Place" ("generatedTitle", "id", "lat", "lng", "wikiUrl") SELECT "generatedTitle", "id", "lat", "lng", "wikiUrl" FROM "Place";
DROP TABLE "Place";
ALTER TABLE "new_Place" RENAME TO "Place";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
