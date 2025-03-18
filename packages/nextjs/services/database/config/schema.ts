import { ReviewAction, UserRole } from "./types";
import { SQL, relations, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export function lower(address: AnyPgColumn): SQL {
  return sql`lower(${address})`;
}

export const reviewActionEnum = pgEnum("review_action_enum", [
  ReviewAction.REJECTED,
  ReviewAction.ACCEPTED,
  ReviewAction.SUBMITTED,
]);

export const userRoleEnum = pgEnum("user_role_enum", [UserRole.USER, UserRole.BUILDER, UserRole.ADMIN]);

export const users = pgTable(
  "users",
  {
    userAddress: varchar({ length: 42 }).primaryKey(), // Ethereum wallet address
    role: userRoleEnum().default(UserRole.USER), // Using the enum and setting default
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
    socialTelegram: varchar({ length: 255 }),
    socialX: varchar({ length: 255 }),
    socialGithub: varchar({ length: 255 }),
    socialInstagram: varchar({ length: 255 }),
    socialDiscord: varchar({ length: 255 }),
    socialEmail: varchar({ length: 255 }),
  },
  table => [uniqueIndex("idUniqueIndex").on(lower(table.userAddress))],
);

type ExternalLink = Partial<{
  link: string;
  claim: string;
}>;

export const challenges = pgTable("challenges", {
  id: varchar({ length: 255 }).primaryKey(), // Unique identifier for the challenge
  challengeName: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  sortOrder: integer().notNull(),
  github: varchar({ length: 255 }), // Repository reference for the challenge
  autograding: boolean().default(false), // Whether the challenge supports automatic grading
  disabled: boolean().default(false),
  previewImage: varchar({ length: 255 }),
  icon: varchar({ length: 255 }),
  dependencies: varchar({ length: 255 }).notNull().array(),
  externalLink: jsonb("external_link").$type<ExternalLink>(),
});

export const userChallenges = pgTable(
  "user_challenges",
  {
    id: serial().primaryKey(),
    userAddress: varchar({ length: 42 })
      .notNull()
      .references(() => users.userAddress),
    challengeId: varchar({ length: 255 })
      .notNull()
      .references(() => challenges.id),
    frontendUrl: varchar({ length: 255 }),
    contractUrl: varchar({ length: 255 }),
    reviewComment: text(), // Feedback provided during autograding
    submittedAt: timestamp().notNull().defaultNow(),
    reviewAction: reviewActionEnum(), // Final review decision from autograder (REJECTED or ACCEPTED). Initially set to SUBMITTED.
    signature: varchar({ length: 255 }), // Added signature field from events table
  },
  table => [
    index("user_challenge_lookup_idx").on(table.userAddress),
    index("user_challenge_review_idx").on(table.userAddress, table.reviewAction),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  userChallenges: many(userChallenges),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  userChallenges: many(userChallenges),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.userAddress],
    references: [users.userAddress],
  }),
  challenge: one(challenges, {
    fields: [userChallenges.challengeId],
    references: [challenges.id],
  }),
}));
