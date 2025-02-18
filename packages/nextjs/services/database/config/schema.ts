import { relations, sql } from "drizzle-orm";
import { pgEnum, pgTable, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";

export const reviewActionEnum = pgEnum("review_action_enum", ["REJECTED", "ACCEPTED", "SUBMITTED"]);
export const eventTypeEnum = pgEnum("event_type_enum", ["challenge.submit", "challenge.autograde"]);

// TODO: Define the right schema.
export const users = pgTable("users", {
  id: varchar("id", { length: 42 }).primaryKey(),
  creationTimestamp: timestamp("creation_timestamp").default(sql`now()`),
});

export const userChallenges = pgTable(
  "user_challenges",
  {
    userChallengeId: serial("userChallengeId").primaryKey(),
    userAddress: varchar("userAddress", { length: 42 })
      .notNull()
      .references(() => users.id),
    challengeCode: varchar("challengeCode", { length: 255 }).notNull(),
    frontendUrl: varchar("frontendUrl", { length: 255 }),
    contractUrl: varchar("contractUrl", { length: 255 }),
    reviewComment: text("reviewComment"),
    submittedTimestamp: timestamp("submittedTimestamp").defaultNow(),
    reviewAction: reviewActionEnum("reviewAction"),
  },
  table => [unique().on(table.userAddress, table.challengeCode)],
);

export const usersRelations = relations(users, ({ many }) => ({
  userChallenges: many(userChallenges),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.userAddress],
    references: [users.id],
  }),
}));

export const events = pgTable("events", {
  eventId: serial("eventId").primaryKey(),
  eventType: eventTypeEnum("eventType").notNull(),
  eventTimestamp: timestamp("eventTimestamp").defaultNow(),
  userAddress: varchar("userAddress", { length: 42 }).notNull(),
  challengeCode: varchar("challengeCode", { length: 255 }),
});
