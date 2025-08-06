CREATE TYPE "public"."batch_network" AS ENUM('arbitrum', 'optimism');--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "network" "batch_network" NOT NULL;