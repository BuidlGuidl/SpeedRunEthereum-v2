CREATE TABLE "user_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_address" varchar(42) NOT NULL,
	"author_address" varchar(42) NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_user_address_users_user_address_fk" FOREIGN KEY ("user_address") REFERENCES "public"."users"("user_address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_author_address_users_user_address_fk" FOREIGN KEY ("author_address") REFERENCES "public"."users"("user_address") ON DELETE no action ON UPDATE no action;