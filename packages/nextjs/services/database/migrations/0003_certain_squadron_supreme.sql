CREATE TABLE "build_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"build_id" integer NOT NULL,
	"liker_address" varchar(42) NOT NULL,
	"liked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "builds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"desc" text,
	"build_type" varchar(50),
	"builder_address" varchar(42) NOT NULL,
	"co_builder_addresses" varchar(42)[],
	"demo_url" varchar(255),
	"video_url" varchar(255),
	"image_url" varchar(255),
	"github_url" varchar(255),
	"submitted_timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "build_likes" ADD CONSTRAINT "build_likes_build_id_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."builds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "build_likes" ADD CONSTRAINT "build_likes_liker_address_users_user_address_fk" FOREIGN KEY ("liker_address") REFERENCES "public"."users"("user_address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "builds" ADD CONSTRAINT "builds_builder_address_users_user_address_fk" FOREIGN KEY ("builder_address") REFERENCES "public"."users"("user_address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "build_like_unique_idx" ON "build_likes" USING btree ("build_id","liker_address");--> statement-breakpoint
CREATE INDEX "build_builder_idx" ON "builds" USING btree ("builder_address");--> statement-breakpoint
CREATE INDEX "build_co_builders_idx" ON "builds" USING btree ("co_builder_addresses");