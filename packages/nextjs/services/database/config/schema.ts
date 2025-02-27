import { ChallengeId, EventType, ReviewAction, UserRole } from "./types";
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
} from "drizzle-orm/pg-core";

export function lower(address: AnyPgColumn): SQL {
  return sql`lower(${address})`;
}

export const reviewActionEnum = pgEnum("review_action_enum", [
  ReviewAction.REJECTED,
  ReviewAction.ACCEPTED,
  ReviewAction.SUBMITTED,
]);

export const eventTypeEnum = pgEnum("event_type_enum", [
  EventType.CHALLENGE_SUBMIT,
  EventType.CHALLENGE_AUTOGRADE,
  EventType.USER_CREATE,
]);

export const userRoleEnum = pgEnum("user_role_enum", [UserRole.USER, UserRole.ADMIN]);

export const challengeIdEnum = pgEnum("challenge_id_enum", [
  ChallengeId.SIMPLE_NFT_EXAMPLE,
  ChallengeId.DECENTRALIZED_STAKING,
  ChallengeId.TOKEN_VENDOR,
  ChallengeId.DICE_GAME,
  ChallengeId.MINIMUM_VIABLE_EXCHANGE,
  ChallengeId.STATE_CHANNELS,
  ChallengeId.MULTISIG,
  ChallengeId.SVG_NFT,
]);

export const users = pgTable(
  "users",
  {
    userAddress: varchar({ length: 42 }).primaryKey(), // Ethereum wallet address
    role: userRoleEnum().default(UserRole.USER), // Using the enum and setting default
    createdAt: timestamp().defaultNow(),
    socialTelegram: varchar({ length: 255 }),
    socialTwitter: varchar({ length: 255 }),
    socialGithub: varchar({ length: 255 }),
    socialInstagram: varchar({ length: 255 }),
    socialDiscord: varchar({ length: 255 }),
    socialEmail: varchar({ length: 255 }),
  },
  table => [uniqueIndex("idUniqueIndex").on(lower(table.userAddress))],
);

export const challenges = pgTable("challenges", {
  id: challengeIdEnum().primaryKey(), // Unique identifier for the challenge
  challengeName: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  sortOrder: integer().notNull(),
  github: varchar({ length: 255 }), // Repository reference for the challenge
  autograding: boolean().default(false), // Whether the challenge supports automatic grading
  disabled: boolean().default(false),
  previewImage: varchar({ length: 255 }),
  dependencies: challengeIdEnum().array(),
});

export const userChallenges = pgTable(
  "user_challenges",
  {
    userAddress: varchar({ length: 42 })
      .notNull()
      .references(() => users.userAddress),
    challengeId: varchar({ length: 255 })
      .notNull()
      .references(() => challenges.id),
    frontendUrl: varchar({ length: 255 }),
    contractUrl: varchar({ length: 255 }),
    reviewComment: text(), // Feedback provided during autograding
    submittedAt: timestamp().defaultNow(),
    reviewAction: reviewActionEnum(), // Final review decision from autograder (REJECTED or ACCEPTED). Initially set to SUBMITTED.
  },
  table => [primaryKey({ columns: [table.userAddress, table.challengeId] })],
);

export const events = pgTable("events", {
  eventId: serial().primaryKey(),
  eventType: eventTypeEnum().notNull(), // Type of event (CHALLENGE_SUBMIT, CHALLENGE_AUTOGRADE, USER_CREATE)
  eventAt: timestamp().defaultNow(),
  signature: varchar({ length: 255 }), // Cryptographic signature of the event
  userAddress: varchar({ length: 42 })
    .notNull()
    .references(() => users.userAddress),
  payload: jsonb()
    .notNull()
    .$defaultFn(() => ({})), // Flexible event payload stored as JSONB
});

export const usersRelations = relations(users, ({ many }) => ({
  userChallenges: many(userChallenges),
  events: many(events),
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

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userAddress],
    references: [users.userAddress],
  }),
}));
