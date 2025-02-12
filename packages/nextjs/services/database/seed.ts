import { users, challenges, userChallenges, events } from "./config/schema";
import * as schema from "./config/schema";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as path from "path";
import { Client } from "pg";

// Import seed data
import seedData from "./seed.json";

// Define types for the seed data
interface SocialLinks {
  twitter?: string;
  telegram?: string;
  github?: string;
  discord?: string;
  email?: string;
  instagram?: string;
}

interface ChallengeData {
  deployedUrl: string;
  submittedTimestamp: number;
  contractUrl: string;
  reviewComment: string;
  autograding: boolean;
  status: "ACCEPTED" | "REJECTED";
}

interface UserData {
  role: string;
  creationTimestamp: number;
  socialLinks?: SocialLinks;
  joinedBg?: boolean;
  challenges?: Record<string, ChallengeData>;
}

interface EventPayload {
  challengeId?: string;
  contractUrl?: string;
  deployedUrl?: string;
  userAddress: string;
  autograding?: boolean;
  reviewAction?: "ACCEPTED" | "REJECTED";
  reviewMessage?: string;
}

interface Event {
  payload: EventPayload;
  signature: string;
  timestamp: number;
  type: "challenge.submit" | "challenge.autograde";
}

interface SeedData {
  version: string;
  users: Record<string, UserData>;
  events: Event[];
}

dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

async function seed() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });
  await client.connect();
  const db = drizzle(client, { schema });

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(events).execute();
    await db.delete(userChallenges).execute();
    await db.delete(challenges).execute();
    await db.delete(users).execute();

    // Insert users
    console.log("Inserting users...");
    for (const [userAddress, userData] of Object.entries(seedData.users as Record<string, UserData>)) {
      await db.insert(users).values({
        userAddress,
        role: userData.role,
        creationTimestamp: userData.creationTimestamp,
        joinedBg: userData.joinedBg || false,
        email: userData.socialLinks?.email,
        telegram: userData.socialLinks?.telegram,
        twitter: userData.socialLinks?.twitter,
        github: userData.socialLinks?.github,
      }).execute();
    }

    // Insert challenges
    console.log("Inserting challenges...");
    const uniqueChallenges = new Set<string>();
    Object.values(seedData.users as Record<string, UserData>).forEach(userData => {
      if (userData.challenges) {
        Object.keys(userData.challenges).forEach(challengeCode => {
          uniqueChallenges.add(challengeCode);
        });
      }
    });

    for (const challengeCode of uniqueChallenges) {
      await db.insert(challenges).values({
        challengeCode,
        challengeName: challengeCode.split('-').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        autograding: true,
      }).execute();
    }

    // Insert user challenges
    console.log("Inserting user challenges...");
    for (const [userAddress, userData] of Object.entries(seedData.users as Record<string, UserData>)) {
      if (userData.challenges) {
        for (const [challengeCode, challengeData] of Object.entries(userData.challenges)) {
          await db.insert(userChallenges).values({
            userAddress,
            challengeCode,
            reviewComment: challengeData.reviewComment,
            submittedTimestamp: challengeData.submittedTimestamp,
            reviewAction: challengeData.status,
          }).execute();
        }
      }
    }

    // Insert events
    console.log("Inserting events...");
    for (const event of (seedData as SeedData).events) {
      await db.insert(events).values({
        eventType: event.type,
        timestamp: event.timestamp,
        signature: event.signature,
        userAddress: event.payload.userAddress,
        challengeCode: event.payload.challengeId,
        autograding: event.payload.autograding,
        reviewAction: event.payload.reviewAction,
        reviewMessage: event.payload.reviewMessage,
      }).execute();
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seed()
  .catch(error => {
    console.error("Error in seed script:", error);
    process.exit(1);
  });
