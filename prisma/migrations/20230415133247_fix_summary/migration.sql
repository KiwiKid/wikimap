-- This is an empty migration.
TRUNCATE TABLE "Place";

 ALTER TABLE "Place"  
ADD COLUMN IF NOT EXISTS    "summary" TEXT NOT NULL;