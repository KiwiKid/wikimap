/*
  Warnings:

  - Added the required column `content` to the `Place` table without a default value. This is not possible if the table is not empty.
  - Added the required column `info` to the `Place` table without a default value. This is not possible if the table is not empty.
  - Added the required column `main_image_url` to the `Place` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
TRUNCATE TABLE "Place";
-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "content" JSONB NOT NULL,
ADD COLUMN     "info" JSONB NOT NULL,
ADD COLUMN     "main_image_url" TEXT NOT NULL,
ADD COLUMN     "summary" TEXT NOT NULL;
