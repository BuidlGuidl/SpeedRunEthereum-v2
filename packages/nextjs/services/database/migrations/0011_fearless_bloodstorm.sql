CREATE TYPE "public"."batch_network" AS ENUM('arbitrum', 'optimism');
ALTER TABLE "batches" ADD COLUMN "network" "batch_network" DEFAULT 'optimism';
ALTER TABLE "batches" ALTER COLUMN "network" SET NOT NULL;
