CREATE TABLE "chat_conversations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_address" varchar(42) NOT NULL,
	"challenge_id" varchar(255) NOT NULL,
	"messages" jsonb NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
