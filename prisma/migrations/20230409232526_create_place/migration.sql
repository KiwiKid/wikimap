-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generatedTitle" TEXT NOT NULL,
    "wikiUrl" TEXT NOT NULL,
    "lat" INTEGER NOT NULL,
    "lng" INTEGER NOT NULL
);
