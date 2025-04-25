CREATE TYPE "public"."build_category_enum" AS ENUM('DeFi', 'Gaming', 'NFTs', 'Social', 'DAOs & Governance', 'Dev Tooling', 'Identity & Reputation', 'RWA & Supply Chain', 'AI Agents', 'Prediction Markets');--> statement-breakpoint
CREATE TYPE "public"."build_type_enum" AS ENUM('Dapp', 'Infrastructure', 'Challenge submission', 'Content', 'Design', 'Other');--> statement-breakpoint
CREATE TABLE "build_builders" (
	"build_id" varchar(40) NOT NULL,
	"user_address" varchar(42) NOT NULL,
	"is_owner" boolean DEFAULT false NOT NULL,
	CONSTRAINT "build_builders_build_id_user_address_pk" PRIMARY KEY("build_id","user_address")
);
--> statement-breakpoint
CREATE TABLE "build_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"build_id" varchar(40) NOT NULL,
	"liker_address" varchar(42) NOT NULL,
	"liked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "builds" (
	"id" varchar(40) PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"name" varchar(255) NOT NULL,
	"desc" text,
	"build_type" "build_type_enum",
	"build_category" "build_category_enum",
	"demo_url" varchar(255),
	"video_url" varchar(255),
	"image_url" varchar(255),
	"github_url" varchar(255),
	"submitted_timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "build_builders" ADD CONSTRAINT "build_builders_build_id_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."builds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "build_builders" ADD CONSTRAINT "build_builders_user_address_users_user_address_fk" FOREIGN KEY ("user_address") REFERENCES "public"."users"("user_address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "build_likes" ADD CONSTRAINT "build_likes_build_id_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."builds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "build_likes" ADD CONSTRAINT "build_likes_liker_address_users_user_address_fk" FOREIGN KEY ("liker_address") REFERENCES "public"."users"("user_address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "build_builder_build_idx" ON "build_builders" USING btree ("build_id");--> statement-breakpoint
CREATE INDEX "build_builder_user_idx" ON "build_builders" USING btree ("user_address");--> statement-breakpoint
CREATE UNIQUE INDEX "build_like_unique_idx" ON "build_likes" USING btree ("build_id","liker_address");--> statement-breakpoint
CREATE INDEX "build_name_idx" ON "builds" USING btree ("name");--> statement-breakpoint
CREATE INDEX "build_type_idx" ON "builds" USING btree ("build_type");--> statement-breakpoint
CREATE INDEX "build_category_idx" ON "builds" USING btree ("build_category");