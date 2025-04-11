CREATE TYPE "public"."review_action_enum" AS ENUM('REJECTED', 'ACCEPTED', 'SUBMITTED');--> statement-breakpoint
CREATE TYPE "public"."user_role_enum" AS ENUM('USER', 'BUILDER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"challenge_name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer NOT NULL,
	"github" varchar(255),
	"autograding" boolean DEFAULT false,
	"disabled" boolean DEFAULT false,
	"preview_image" varchar(255),
	"icon" varchar(255),
	"dependencies" varchar(255)[],
	"external_link" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_address" varchar(42) NOT NULL,
	"challenge_id" varchar(255) NOT NULL,
	"frontend_url" varchar(255),
	"contract_url" varchar(255),
	"review_comment" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"review_action" "review_action_enum",
	"signature" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_address" varchar(42) PRIMARY KEY NOT NULL,
	"role" "user_role_enum" DEFAULT 'USER',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"social_telegram" varchar(255),
	"social_x" varchar(255),
	"social_github" varchar(255),
	"social_instagram" varchar(255),
	"social_discord" varchar(255),
	"social_email" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_user_address_users_user_address_fk" FOREIGN KEY ("user_address") REFERENCES "public"."users"("user_address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_challenge_lookup_idx" ON "user_challenges" USING btree ("user_address");--> statement-breakpoint
CREATE INDEX "user_challenge_review_idx" ON "user_challenges" USING btree ("user_address","review_action");--> statement-breakpoint
CREATE UNIQUE INDEX "idUniqueIndex" ON "users" USING btree (lower("user_address"));