# Database Migration: Challenge Submission History Refactoring

This migration refactors the database schema to remove the events table and enhance the userChallenges table to store all submission history, with a comprehensive view for tracking system events.

## Changes Implemented

1. **Enhanced userChallenges Table**

   - Added auto-incrementing ID as primary key
   - Store all submissions in userChallenges (history of attempts)
   - Added signature field from events table

2. **User Updates Tracking**

   - Added lastUpdatedAt field to users table
   - This timestamp is updated whenever user data changes

3. **Latest Events View**

   - Created a database view combining:
     - User creations (from users.createdAt)
     - User updates (from users.lastUpdatedAt)
     - Challenge submissions (from userChallenges.submittedAt)
   - Ordered by timestamp descending

4. **Removed Events Table**
   - Migrated necessary data to userChallenges
   - Removed table and related code

## Running the Migration

To run the migration in development, use the following command:

```bash
yarn db:migrate
```

For production environments, use:

```bash
yarn db:migrate:prod
```

The production migration script includes a 5-second delay to allow cancellation and runs with the production environment variables.

To test if the migration was successful, run:

```bash
yarn db:migrate:test
```

This will run a series of tests to verify that:

1. The events table has been removed
2. The userChallenges table has the new schema with the id column
3. The users table has the lastUpdatedAt column
4. The latest_events_view exists and returns data
5. The challenge history can be retrieved

This will:

1. Add the lastUpdatedAt column to the users table
2. Create a new userChallenges table with the updated schema
3. Copy data from the old userChallenges table to the new one
4. Update signatures from the events table
5. Drop the old userChallenges table and rename the new one
6. Create the latest_events_view
7. Drop the events table and event_type_enum

## Accessing the Latest Events

After migration, you can access the latest events using the new repository functions:

```typescript
import {
  getLatestEvents,
  getLatestEventsByChallenge,
  getLatestEventsByType,
  getLatestEventsByUser,
} from "~~/services/database/repositories/latestEvents";

// Get all latest events with pagination
const events = await getLatestEvents(50, 0);

// Get latest events for a specific user
const userEvents = await getLatestEventsByUser("0x123...");

// Get latest events for a specific challenge
const challengeEvents = await getLatestEventsByChallenge("challenge-id");

// Get latest events by type
const typeEvents = await getLatestEventsByType("USER_CREATE");
```

## Accessing Challenge Submission History

You can now access the full history of challenge submissions:

```typescript
import { getUserChallengeHistory } from "~~/services/database/repositories/userChallenges";

// Get all submissions for a user and challenge
const history = await getUserChallengeHistory("0x123...", "challenge-id");
```
