import { sql } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// TODO: Define the right schema.
export const users = pgTable("users", {
  id: varchar("id", { length: 42 }).primaryKey(),
  creationTimestamp: timestamp("creation_timestamp").default(sql`now()`),
});
