CREATE TYPE "public"."batch_status_enum" AS ENUM('closed', 'open');--> statement-breakpoint
CREATE TYPE "public"."batch_user_status_enum" AS ENUM('graduate', 'candidate');--> statement-breakpoint
CREATE TABLE "batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"start_date" timestamp NOT NULL,
	"status" "batch_status_enum" NOT NULL,
	"contract_address" varchar(42),
	"telegram_link" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "batch_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "batch_status" "batch_user_status_enum";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;