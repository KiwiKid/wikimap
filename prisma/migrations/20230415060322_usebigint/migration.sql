/*
  Warnings:

  - Changed the type of `wiki_id` on the `Place` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

TRUNCATE TABLE "Place";
-- AlterTable
ALTER TABLE "Place" DROP COLUMN "wiki_id",
ADD COLUMN     "wiki_id" BIGINT NOT NULL;
