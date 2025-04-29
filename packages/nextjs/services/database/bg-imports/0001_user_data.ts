import { db } from "../config/postgresClient";
import { lower, users as schemaUsers } from "../config/schema";
import { BGBuilder } from "./types";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

const BG_USERS_ENDPOINT = `${process.env.NEXT_PUBLIC_BG_BACKEND}/builders`;

async function importData() {
  try {
    console.log("==== Importing Location and Socials ====");
    console.log("Fetching data from BG firebase...");
    const response = await fetch(BG_USERS_ENDPOINT);
    const data: BGBuilder[] = await response.json();
    console.log(`Fetched ${data.length} users`);

    // Deduplicate input by lowercased address (since user "0xc863dfee737c803c93af4b6b27029294f6a56eb5" has multiple casing profiles)
    const seen = new Set<string>();
    const dedupedData = data.filter(builder => {
      const addr = builder.id?.toLowerCase();
      if (!addr || seen.has(addr)) return false;
      seen.add(addr);
      return true;
    });

    const addresses = dedupedData.map(b => b.id.toLowerCase());
    const existingUsers = await db.query.users.findMany({
      where: (fields, { inArray }) => inArray(lower(fields.userAddress), addresses),
      columns: { userAddress: true },
    });
    const existingSet = new Set(existingUsers.map(u => u.userAddress.toLowerCase()));

    const upsertQueries = dedupedData
      .map(builder => {
        const userAddress = builder.id;
        if (!userAddress) return null;
        const socials = {
          socialTelegram: builder.socialLinks?.telegram,
          socialX: builder.socialLinks?.twitter,
          socialGithub: builder.socialLinks?.github,
          socialInstagram: builder.socialLinks?.instagram,
          socialDiscord: builder.socialLinks?.discord,
          socialEmail: builder.socialLinks?.email,
        };
        if (existingSet.has(userAddress.toLowerCase())) {
          return db
            .update(schemaUsers)
            .set({
              ...socials,
              location: builder.location || null,
              updatedAt: new Date(),
            })
            .where(eq(lower(schemaUsers.userAddress), userAddress.toLowerCase()));
        } else {
          return db.insert(schemaUsers).values({
            userAddress,
            ...socials,
            location: builder.location || null,
            ...(builder.creationTimestamp && { createdAt: new Date(builder.creationTimestamp) }),
          });
        }
      })
      .filter(Boolean);

    if (upsertQueries.length > 0) {
      await db.executeQueries(upsertQueries as any);
    }
  } catch (error) {
    console.error("Error during data import:", error);
  } finally {
    await db.close();
    process.exit(0);
  }
}

importData();
