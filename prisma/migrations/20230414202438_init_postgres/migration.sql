-- CreateTable
CREATE TABLE "LatLngToProcess" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LatLngToProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "wiki_url" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "info" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "main_image" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "categories" TEXT[],
    "references" TEXT NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LatLngToProcess_lat_lng_key" ON "LatLngToProcess"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "Place_lat_lng_key" ON "Place"("lat", "lng");
