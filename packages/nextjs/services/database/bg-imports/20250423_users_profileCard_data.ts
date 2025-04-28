import { db } from "../config/postgresClient";
import { lower, users as schemaUsers } from "../config/schema";
import { BGBuilder } from "./types";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

const BG_USERS_ENDPOINT = `${process.env.NEXT_PUBLIC_BG_BACKEND}/builders`;

async function importLocationAndSocials() {
  try {
    console.log("==== Importing Location and Socials ====");
    console.log("Fetching data from BG firebase...");
    const response = await fetch(BG_USERS_ENDPOINT);
    const data: BGBuilder[] = await response.json();
    console.log(`Fetched ${data.length} users`);

    if ("batch" in db && db.constructor.name === "NeonHttpDatabase") {
      // Since user "0xc863dfee737c803c93af4b6b27029294f6a56eb5" has multiple casing profiles, we need to deduplicate the data
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
            });
          }
        })
        .filter(Boolean);

      if (upsertQueries.length > 0) {
        await db.batch(upsertQueries as any);
      }
      console.log("Batch upsert complete.");
    } else {
      await db.transaction(async tx => {
        for (const builder of data) {
          const userAddress = builder.id;
          if (!userAddress) continue;
          const existingUser = await tx.query.users.findFirst({
            where: eq(lower(schemaUsers.userAddress), userAddress.toLowerCase()),
          });
          const socials = {
            socialTelegram: builder.socialLinks?.telegram,
            socialX: builder.socialLinks?.twitter,
            socialGithub: builder.socialLinks?.github,
            socialInstagram: builder.socialLinks?.instagram,
            socialDiscord: builder.socialLinks?.discord,
            socialEmail: builder.socialLinks?.email,
          };
          if (!existingUser) {
            const newUser = {
              userAddress,
              ...socials,
              location: builder.location || null,
            };
            await tx.insert(schemaUsers).values(newUser);
            console.log(`Created user: ${userAddress}`);
          } else {
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
    }
  } catch (error) {
    console.error("Error during data import:", error);
    console.log("Transaction rolled back due to error.");
  } finally {
    await db.close();
    process.exit(0);
  }
}

importLocationAndSocials();
