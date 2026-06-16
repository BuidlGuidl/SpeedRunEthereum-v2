CREATE TABLE "chat_token_usage" (
	"user_address" varchar(42) NOT NULL,
	"day" varchar(10) NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chat_token_usage_user_address_day_pk" PRIMARY KEY("user_address","day")
);
