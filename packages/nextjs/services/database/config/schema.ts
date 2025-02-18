import { relations } from "drizzle-orm";
import { boolean, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const reviewActionEnum = pgEnum("review_action_enum", ["REJECTED", "ACCEPTED", "SUBMITTED"]);
export const eventTypeEnum = pgEnum("event_type_enum", ["challenge.submit", "challenge.autograde", "user.create"]);
export const userRoleEnum = pgEnum("user_role_enum", ["user", "admin"]);

export const users = pgTable("users", {
  userAddress: varchar("userAddress", { length: 42 }).primaryKey(), // Ethereum wallet address
  role: userRoleEnum("role").default("user"), // Using the enum and setting default
  creationTimestamp: timestamp("creationTimestamp").defaultNow(),
  email: varchar("email", { length: 255 }),
  telegram: varchar("telegram", { length: 255 }),
  twitter: varchar("twitter", { length: 255 }),
  github: varchar("github", { length: 255 }),
});

export const challenges = pgTable("challenges", {
  challengeCode: varchar("challengeCode", { length: 255 }).primaryKey(), // Unique identifier for the challenge
  challengeName: varchar("challengeName", { length: 255 }).notNull(),
  autograding: boolean("autograding").default(false), // Whether the challenge supports automatic grading
});

export const userChallenges = pgTable("user_challenges", {
  userChallengeId: serial("userChallengeId").primaryKey(),
  userAddress: varchar("userAddress", { length: 42 })
    .notNull()
    .references(() => users.userAddress),
  challengeCode: varchar("challengeCode", { length: 255 })
    .notNull()
    .references(() => challenges.challengeCode),
  frontendUrl: varchar("frontendUrl", { length: 255 }),
  contractUrl: varchar("contractUrl", { length: 255 }),
  reviewComment: text("reviewComment"), // Feedback provided during from the autograder
  submittedTimestamp: timestamp("submittedTimestamp").defaultNow(),
  reviewAction: reviewActionEnum("reviewAction"), // Final review decision from autograder (REJECTED or ACCEPTED)
});

export const events = pgTable("events", {
  eventId: serial("eventId").primaryKey(),
  eventType: eventTypeEnum("eventType").notNull(), // Type of event (challenge.submission, challenge.autograding, user.create)
  eventTimestamp: timestamp("eventTimestamp").defaultNow(), // Renamed for clarity
  signature: varchar("signature", { length: 255 }), // Cryptographic signature of the event
  userAddress: varchar("userAddress", { length: 42 })
    .notNull()
    .references(() => users.userAddress),
  challengeCode: varchar("challengeCode", { length: 255 }).references(() => challenges.challengeCode),
  frontendUrl: varchar("frontendUrl", { length: 255 }),
  contractUrl: varchar("contractUrl", { length: 255 }),
  reviewAction: reviewActionEnum("reviewAction"),
  reviewMessage: text("reviewMessage"),
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
    fields: [userChallenges.challengeCode],
    references: [challenges.challengeCode],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userAddress],
    references: [users.userAddress],
  }),
  challenge: one(challenges, {
    fields: [events.challengeCode],
    references: [challenges.challengeCode],
  }),
}));
