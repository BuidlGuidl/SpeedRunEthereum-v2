import { SQL, relations, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
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

export const reviewActionEnum = pgEnum("review_action_enum", ["REJECTED", "ACCEPTED", "SUBMITTED"]);
export const eventTypeEnum = pgEnum("event_type_enum", ["challenge.submit", "challenge.autograde", "user.create"]);
export const userRoleEnum = pgEnum("user_role_enum", ["user", "admin"]);

export const users = pgTable(
  "users",
  {
    userAddress: varchar({ length: 42 }).primaryKey(), // Ethereum wallet address
    role: userRoleEnum().default("user"), // Using the enum and setting default
    createdAt: timestamp().defaultNow(),
    email: varchar({ length: 255 }),
    telegram: varchar({ length: 255 }),
    twitter: varchar({ length: 255 }),
    github: varchar({ length: 255 }),
  },
  table => [uniqueIndex("idUniqueIndex").on(lower(table.userAddress))],
);

export const challenges = pgTable("challenges", {
  id: varchar({ length: 255 }).primaryKey(), // Unique identifier for the challenge
  challengeName: varchar({ length: 255 }).notNull(),
  github: varchar({ length: 255 }), // Repository reference for the challenge
  autograding: boolean().default(false), // Whether the challenge supports automatic grading
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
  eventType: eventTypeEnum().notNull(), // Type of event (challenge.submission, challenge.autograding, user.create)
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
