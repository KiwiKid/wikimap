-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generatedTitle" TEXT,
    "wikiUrl" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL
);
INSERT INTO "new_Place" ("generatedTitle", "id", "lat", "lng", "wikiUrl") SELECT "generatedTitle", "id", "lat", "lng", "wikiUrl" FROM "Place";
DROP TABLE "Place";
ALTER TABLE "new_Place" RENAME TO "Place";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
