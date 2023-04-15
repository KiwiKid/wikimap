/*
  Warnings:

  - The `images` column on the `Place` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `references` column on the `Place` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Place" DROP COLUMN "images",
ADD COLUMN     "images" TEXT[],
DROP COLUMN "references",
ADD COLUMN     "references" TEXT[];

-- DropTable
DROP TABLE "Example";
