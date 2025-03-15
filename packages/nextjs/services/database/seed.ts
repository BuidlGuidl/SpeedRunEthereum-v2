import { challenges, userChallenges, users } from "./config/schema";
import { seedChallenges, seedUserChallenges, seedUsers } from "./seed.data";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as path from "path";
import { Client } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

async function seed() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });
  await client.connect();
  const db = drizzle(client, {
    schema: { challenges, userChallenges, users },
    casing: "snake_case",
  });

  try {
    // Clear existing data in a transaction
    await db.transaction(async tx => {
      console.log("Clearing existing data...");
      // events table has been removed
      await tx.delete(userChallenges).execute();
      await tx.delete(challenges).execute();
      await tx.delete(users).execute();
    });

    // Insert fresh data
    console.log("Inserting users...");
    await db.insert(users).values(seedUsers).execute();

    console.log("Inserting challenges...");
    await db.insert(challenges).values(seedChallenges).execute();

    console.log("Inserting user challenges...");
    await db.insert(userChallenges).values(seedUserChallenges).execute();

    // Create the latest_events_view
    console.log("Creating latest_events_view...");
    await db.execute(sql`
      CREATE OR REPLACE VIEW latest_events_view AS
      -- User creations
      SELECT
        'USER_CREATE'::text as event_type,
        user_address::text,
        NULL::text as challenge_id,
        created_at as event_at,
        NULL::text as review_action,
        NULL::integer as id,
        NULL::text as challenge_name
      FROM users

      UNION ALL

      -- User updates
      SELECT
        'USER_UPDATE'::text as event_type,
        user_address::text,
        NULL::text as challenge_id,
        last_updated_at as event_at,
        NULL::text as review_action,
        NULL::integer as id,
        NULL::text as challenge_name
      FROM users
      WHERE last_updated_at > created_at

      UNION ALL

      -- Challenge submissions
      SELECT
        'CHALLENGE_SUBMIT'::text as event_type,
        uc.user_address::text,
        uc.challenge_id::text,
        uc.submitted_at as event_at,
        uc.review_action::text,
        uc.id::integer,
        c.challenge_name::text
      FROM user_challenges uc
      LEFT JOIN challenges c ON uc.challenge_id = c.id

      ORDER BY event_at DESC;
    `);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch(error => {
  console.error("Error in seed script:", error);
  process.exit(1);
});
