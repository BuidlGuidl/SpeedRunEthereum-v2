import { sql } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";

export type LatestEvent = {
  event_type: string;
  user_address: string;
  challenge_id: string | null;
  event_at: Date;
  review_action: string | null;
  id: number | null;
  challenge_name: string | null;
};

// Create the view if it doesn't exist
export async function createLatestEventsView() {
  try {
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
    console.log("Latest events view created or updated successfully");
  } catch (error) {
    console.error("Error creating latest events view:", error);
  }
}

// Get all latest events with pagination
export async function getLatestEvents(limit = 50, offset = 0) {
  const result = await db.execute(sql`
    SELECT * FROM latest_events_view
    ORDER BY event_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);
  return result;
}

// Get latest events for a specific user
export async function getLatestEventsByUser(userAddress: string, limit = 50) {
  const result = await db.execute(sql`
    SELECT * FROM latest_events_view
    WHERE user_address = ${userAddress}
    ORDER BY event_at DESC
    LIMIT ${limit}
  `);
  return result;
}

// Get latest events for a specific challenge
export async function getLatestEventsByChallenge(challengeId: string, limit = 50) {
  const result = await db.execute(sql`
    SELECT * FROM latest_events_view
    WHERE challenge_id = ${challengeId}
    ORDER BY event_at DESC
    LIMIT ${limit}
  `);
  return result;
}

// Get latest events by type
export async function getLatestEventsByType(eventType: string, limit = 50) {
  const result = await db.execute(sql`
    SELECT * FROM latest_events_view
    WHERE event_type = ${eventType}
    ORDER BY event_at DESC
    LIMIT ${limit}
  `);
  return result;
}
