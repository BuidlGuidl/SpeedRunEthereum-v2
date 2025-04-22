ALTER TABLE "batches" ALTER COLUMN "telegram_link" SET NOT NULL;--> statement-breakpoint

-- First, add a new UUID column
ALTER TABLE "batches" ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();--> statement-breakpoint

-- Update the new column with UUID values based on the old ID
UPDATE "batches" SET "id_new" = gen_random_uuid();--> statement-breakpoint

-- Drop the foreign key constraint from users table
ALTER TABLE "users" DROP CONSTRAINT "users_batch_id_batches_id_fk";--> statement-breakpoint

-- Add a temporary column in users table
ALTER TABLE "users" ADD COLUMN "batch_id_new" uuid;--> statement-breakpoint

-- Update the new column in users table
UPDATE "users" u SET "batch_id_new" = b."id_new" FROM "batches" b WHERE u."batch_id" = b."id";--> statement-breakpoint

-- Drop the old columns
ALTER TABLE "batches" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "batch_id";--> statement-breakpoint

-- Rename the new columns
ALTER TABLE "batches" RENAME COLUMN "id_new" TO "id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "batch_id_new" TO "batch_id";--> statement-breakpoint

-- Add primary key and foreign key constraints
ALTER TABLE "batches" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Add the new bg_subdomain column
ALTER TABLE "batches" ADD COLUMN "bg_subdomain" varchar(255) NOT NULL;
