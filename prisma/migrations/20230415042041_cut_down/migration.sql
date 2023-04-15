/*
  Warnings:

  - You are about to drop the column `categories` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `info` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `main_image` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `references` on the `Place` table. All the data in the column will be lost.
  - Added the required column `wiki_id` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
TRUNCATE TABLE "Place";
-- AlterTable
ALTER TABLE "Place" DROP COLUMN "categories",
DROP COLUMN "content",
DROP COLUMN "images",
DROP COLUMN "info",
DROP COLUMN "main_image",
DROP COLUMN "references",
ADD COLUMN     "wiki_id" TEXT NOT NULL;
