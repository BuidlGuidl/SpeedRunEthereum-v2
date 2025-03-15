import { ReviewAction, UserRole } from "./types";
import { SQL, relations, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  index,
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
    lastUpdatedAt: timestamp().defaultNow().notNull(), // Added lastUpdatedAt field
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
    index("user_challenge_lookup_idx").on(table.userAddress, table.challengeId),
    index("user_completed_challenges_idx").on(table.userAddress, table.reviewAction)
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

// SQL for creating the latest_events_view
export const latestEventsViewSQL = sql`
CREATE OR REPLACE VIEW latest_events_view AS
-- User creations
SELECT
  'USER_CREATE' as event_type,
  user_address,
  NULL as challenge_id,
  created_at as event_at,
  NULL as review_action,
  NULL as id,
  NULL as challenge_name
FROM users

UNION ALL

-- User updates
SELECT
  'USER_UPDATE' as event_type,
  user_address,
  NULL as challenge_id,
  last_updated_at as event_at,
  NULL as review_action,
  NULL as id,
  NULL as challenge_name
FROM users
WHERE last_updated_at > created_at

UNION ALL

-- Challenge submissions
SELECT
  'CHALLENGE_SUBMIT' as event_type,
  uc.user_address,
  uc.challenge_id,
  uc.submitted_at as event_at,
  uc.review_action,
  uc.id,
  c.challenge_name
FROM user_challenges uc
LEFT JOIN challenges c ON uc.challenge_id = c.id

ORDER BY event_at DESC;
`;
