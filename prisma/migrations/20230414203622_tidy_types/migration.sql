/*
  Warnings:

  - Changed the type of `info` on the `Place` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Place" DROP COLUMN "info",
ADD COLUMN     "info" JSONB NOT NULL;
