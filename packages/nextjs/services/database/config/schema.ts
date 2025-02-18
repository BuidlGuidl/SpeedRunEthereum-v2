import { relations } from "drizzle-orm";
import { boolean, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const reviewActionEnum = pgEnum("review_action_enum", ["REJECTED", "ACCEPTED", "SUBMITTED"]);
export const eventTypeEnum = pgEnum("event_type_enum", ["challenge.submit", "challenge.autograde", "user.create"]);
export const userRoleEnum = pgEnum("user_role_enum", ["user", "admin"]);

export const users = pgTable("users", {
  userAddress: varchar("user_address", { length: 42 }).primaryKey(), // Ethereum wallet address
  role: userRoleEnum("role").default("user"), // Using the enum and setting default
  createdAt: timestamp("created_at").defaultNow(),
  email: varchar("email", { length: 255 }),
  telegram: varchar("telegram", { length: 255 }),
  twitter: varchar("twitter", { length: 255 }),
  github: varchar("github", { length: 255 }),
});

export const challenges = pgTable("challenges", {
  id: varchar("id", { length: 255 }).primaryKey(), // Unique identifier for the challenge
  challengeName: varchar("challenge_name", { length: 255 }).notNull(),
  github: varchar("github", { length: 255 }), // Repository reference for the challenge
  autograding: boolean("autograding").default(false), // Whether the challenge supports automatic grading
});

export const userChallenges = pgTable("user_challenges", {
  userChallengeId: serial("user_challenge_id").primaryKey(),
  userAddress: varchar("user_address", { length: 42 })
    .notNull()
    .references(() => users.userAddress),
  challengeId: varchar("challenge_id", { length: 255 })
    .notNull()
    .references(() => challenges.id),
  frontendUrl: varchar("frontend_url", { length: 255 }),
  contractUrl: varchar("contract_url", { length: 255 }),
  reviewComment: text("review_comment"), // Feedback provided during from the autograder
  submittedTimestamp: timestamp("submitted_at").defaultNow(),
  reviewAction: reviewActionEnum("review_action"), // Final review decision from autograder (REJECTED or ACCEPTED)
});

export const events = pgTable("events", {
  eventId: serial("event_id").primaryKey(),
  eventType: eventTypeEnum("event_type").notNull(), // Type of event (challenge.submission, challenge.autograding, user.create)
  eventTimestamp: timestamp("event_at").defaultNow(), // Renamed for clarity
  signature: varchar("signature", { length: 255 }), // Cryptographic signature of the event
  userAddress: varchar("user_address", { length: 42 })
    .notNull()
    .references(() => users.userAddress),
  challengeId: varchar("challenge_id", { length: 255 }).references(() => challenges.id),
  frontendUrl: varchar("frontend_url", { length: 255 }),
  contractUrl: varchar("contract_url", { length: 255 }),
  reviewAction: reviewActionEnum("review_action"),
  reviewMessage: text("review_message"),
});

export const usersRelations = relations(users, ({ many }) => ({
  userChallenges: many(userChallenges),
  events: many(events),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  userChallenges: many(userChallenges),
  events: many(events),
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
  challenge: one(challenges, {
    fields: [events.challengeId],
    references: [challenges.id],
  }),
}));
