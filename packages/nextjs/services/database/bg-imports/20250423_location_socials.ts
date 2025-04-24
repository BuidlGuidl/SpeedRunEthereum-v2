import { db } from "../config/postgresClient";
import { lower, users as schemaUsers } from "../config/schema";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

const BG_USERS_ENDPOINT = `${process.env.NEXT_PUBLIC_BG_BACKEND}/builders`;

export type BGBuildersApiResponse = {
  id: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    telegram?: string;
    discord?: string;
    instagram?: string;
    email?: string;
  };
  role?: string;
  function?: string;
  creationTimestamp?: number;
  builds?: { submittedTimestamp: number; id: string }[];
  ens?: string;
  status?: { text?: string; timestamp?: number };
  reachedOut?: boolean;
  scholarship?: boolean;
  batch?: { number?: string; status?: string };
  location?: string;
  builderCohort?: { name?: string; id?: string; url?: string }[];
  stream?: {
    lastContract?: number;
    cap?: string;
    lastIndexedBlock?: number;
    balance?: string;
    streamAddress?: string;
    frequency?: number;
  };
  [key: string]: any;
}[];

async function importLocationAndSocials() {
  try {
    console.log("==== Importing Location and Socials ====");
    console.log("Fetching data from BG firebase...");
    const response = await fetch(BG_USERS_ENDPOINT);
    const data: BGBuildersApiResponse = await response.json();
    console.log(`Fetched ${data.length} users`);

    await db.transaction(async tx => {
      for (const builder of data) {
        const userAddress = builder.id;
        if (!userAddress) continue;
        const existingUser = await tx.query.users.findFirst({
          where: eq(lower(schemaUsers.userAddress), userAddress.toLowerCase()),
        });

        // Prepare socials mapping
        const socials = {
          socialTelegram: builder.socialLinks?.telegram,
          socialX: builder.socialLinks?.twitter,
          socialGithub: builder.socialLinks?.github,
          socialInstagram: builder.socialLinks?.instagram,
          socialDiscord: builder.socialLinks?.discord,
          socialEmail: builder.socialLinks?.email,
        };

        if (!existingUser) {
          // Create new user
          const newUser = {
            userAddress,
            ...socials,
            location: builder.location || null,
          };
          await tx.insert(schemaUsers).values(newUser);
          console.log(`Created user: ${userAddress}`);
        } else {
          // Always update socials and location
          await tx
            .update(schemaUsers)
            .set({
              ...socials,
              location: builder.location || null,
              updatedAt: new Date(),
            })
            .where(eq(lower(schemaUsers.userAddress), userAddress.toLowerCase()));
          console.log(`Updated user: ${userAddress}`);
        }
      }
    });
  } catch (error) {
    console.error("Error during data import:", error);
    console.log("Transaction rolled back due to error.");
  } finally {
    await db.close();
    process.exit(0);
  }
}

importLocationAndSocials();
