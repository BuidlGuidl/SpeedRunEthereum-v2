ALTER TABLE "batches" ALTER COLUMN "telegram_link" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "bg_subdomain" varchar(255) NOT NULL;