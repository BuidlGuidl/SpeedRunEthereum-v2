import { db } from "../config/postgresClient";
import { buildBuilders, buildLikes, builds } from "../config/schema";
import { BuildCategory, BuildType } from "../config/types";
import { BGBuild } from "./types";
import { parse as csvParse } from "csv-parse/sync";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
// @ts-ignore: No type definitions for 'uuid'
import { v5 as uuidv5 } from "uuid";

const categorizationPath = path.join(__dirname, "aux_builds_categorization.csv");

// Check if the categorization file exists before proceeding
if (!fs.existsSync(categorizationPath)) {
  console.warn(
    `ERROR: aux_builds_categorization.csv not found at ${categorizationPath}.\n` +
      `This file is required for the import process. Exiting without importing any data.`,
  );
  process.exit(1);
}

const categorizationRows: Record<string, { type?: string; category?: string }> = {};
csvParse(fs.readFileSync(categorizationPath, "utf-8"), {
  columns: true,
  delimiter: ",",
  relax_column_count: true,
}).forEach(function (row: { ID: string; TYPE?: string; CATEGORY?: string }) {
  categorizationRows[row.ID] = { type: row.TYPE, category: row.CATEGORY };
});

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

const BG_BUILDS_ENDPOINT = `${process.env.NEXT_PUBLIC_BG_BACKEND}/builds`;

// RANDOM UUID to server as a base. It's safe for this to be public
const FIREBASE_TO_UUID_NAMESPACE = "ddeb27fb-d9a0-4624-be4d-4615062daed4";

// Normalize build types from API and CSV file
const TYPE_MAPPER: Record<string, BuildType> = {
  dapp: BuildType.DAPP,
  extension: BuildType.INFRASTRUCTURE,
  infrastructure: BuildType.INFRASTRUCTURE,
  challenge: BuildType.CHALLENGE_SUBMISSION,
  challenge_submission: BuildType.CHALLENGE_SUBMISSION,
  content: BuildType.CONTENT,
  design: BuildType.DESIGN,
};

// Convert Firebase ID to UUID
function convertFirebaseIdToUuid(id: string) {
  return uuidv5(id, FIREBASE_TO_UUID_NAMESPACE);
}

function mapBuildType(apiType: string | undefined | null, buildId?: string): BuildType | null {
  // First try to use the type from the API endpoint
  const type = apiType?.toLowerCase();
  if (type && TYPE_MAPPER[type]) {
    return TYPE_MAPPER[type];
  }

  // If no valid type from API, use the type from CSV file
  if (buildId && categorizationRows[buildId]?.type) {
    const csvType = categorizationRows[buildId].type.toLowerCase();
    if (TYPE_MAPPER[csvType]) {
      return TYPE_MAPPER[csvType];
    }
  }
  return null;
}

//
function mapBuildCategory(buildId: string): BuildCategory | null {
  const row = categorizationRows[buildId];
  if (row && row.category && BuildCategory[row.category as keyof typeof BuildCategory]) {
    return BuildCategory[row.category as keyof typeof BuildCategory];
  }
  return null;
}

// Transform image URL to be accessible for the frontend
function transformImageUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.match(/^https:\/\/storage\.googleapis\.com\/buidlguidl-v3\.appspot\.com\/builds\/[^?]+$/)) return url;
  let imageId = null;
  const fullUrlMatch = url.match(/\/o\/builds%2F([^?]+)/);
  const simpleMatch = url.match(/(?:\/builds\/)?([^\/]+\.(png|jpg|jpeg|gif))$/i);
  if (fullUrlMatch) imageId = decodeURIComponent(fullUrlMatch[1]);
  else if (simpleMatch) imageId = simpleMatch[1];
  return imageId ? `https://storage.googleapis.com/buidlguidl-v3.appspot.com/builds/${imageId}` : url;
}

async function importData() {
  try {
    console.log("==== Importing Builds, Builders, and Likes ====");
    const response = await fetch(BG_BUILDS_ENDPOINT);
    const buildsData: BGBuild[] = await response.json();
    console.log(`Fetched ${buildsData.length} builds from BuidlGuidl API`);

    // Get existing users from the database to avoid errors when importing likes and builders relationships
    const userRows = await db.query.users.findMany({ columns: { userAddress: true } });
    const existingBuilders = new Set(userRows.map(u => u.userAddress));
    console.log(`Found ${existingBuilders.size} existing builders in local database`);

    // Track ignored addresses for logging purposes
    const ignoredBuilders = new Set<string>();

    const transformedBuilds = buildsData.map(build => {
      const buildUuid = convertFirebaseIdToUuid(build.id);
      return {
        ...build,
        uuid: buildUuid,
        coBuilderAddresses: Array.isArray(build.coBuilders) ? build.coBuilders : [],
      };
    });

    // Upsert builds section
    console.log(`Importing ${transformedBuilds.length} builds into database...`);
    const buildQueries = transformedBuilds.map(build => {
      return db
        .insert(builds)
        .values({
          id: build.uuid,
          name: build.name,
          desc: build.desc || null,
          demoUrl: build.demoUrl || null,
          videoUrl: build.videoUrl || null,
          imageUrl: transformImageUrl(build.image),
          githubUrl: build.branch || null,
          buildType: mapBuildType(build.type, build.id),
          buildCategory: mapBuildCategory(build.id),
          submittedTimestamp: build.submittedTimestamp ? new Date(build.submittedTimestamp) : new Date(),
        })
        .onConflictDoNothing();
    });
    await db.executeQueries(buildQueries as any);
    console.log(`✅ Builds import complete (${buildQueries.length} builds processed)`);

    // Database builders handling
    console.log(`Importing build-builder relationships...`);
    function getBuilderRow(buildId: string, address: string, isOwner: boolean) {
      if (existingBuilders.has(address)) {
        return db.insert(buildBuilders).values({ buildId, userAddress: address, isOwner }).onConflictDoNothing();
      }
      ignoredBuilders.add(address);
      return null;
    }

    // Upsert build-builders
    const buildBuilderQueries = [];
    for (const build of transformedBuilds) {
      // Add the main builder
      const ownerRow = getBuilderRow(build.uuid, build.builder, true);
      if (ownerRow) buildBuilderQueries.push(ownerRow);

      // Add all co-builders
      for (const addr of build.coBuilderAddresses) {
        const coBuilderRow = getBuilderRow(build.uuid, addr, false);
        if (coBuilderRow) buildBuilderQueries.push(coBuilderRow);
      }
    }
    await db.executeQueries(buildBuilderQueries as any);
    console.log(`✅ Build-builder relationships import complete (${buildBuilderQueries.length} relationships created)`);

    // Upsert likes
    console.log(`Importing build likes...`);
    const buildLikeQueries = [];
    for (const build of transformedBuilds) {
      for (const userAddress of build.likes || []) {
        if (existingBuilders.has(userAddress)) {
          buildLikeQueries.push(
            db
              .insert(buildLikes)
              .values({ buildId: build.uuid, userAddress, likedAt: new Date() })
              .onConflictDoNothing(),
          );
        } else {
          ignoredBuilders.add(userAddress);
        }
      }
    }
    await db.executeQueries(buildLikeQueries as any);
    console.log(`✅ Build likes import complete (${buildLikeQueries.length} likes processed)`);

    // Clean up builds from builders that don't exist in the database
    console.log(`Cleaning up orphaned builds...`);
    const deleteResult = await db.execute(`DELETE FROM builds WHERE id NOT IN (SELECT build_id FROM build_builders)`);
    const deletedCount = deleteResult.rowCount || 0;
    console.log(`✅ Cleanup complete (${deletedCount} orphaned builds removed)`);

    // Log ignored addresses instead of writing to file
    if (ignoredBuilders.size > 0) {
      console.log(`Ignored ${ignoredBuilders.size} addresses that don't exist in the database.`);
      console.log("Ignored addresses:", Array.from(ignoredBuilders));
    }

    console.log("✅ Build data import successfully completed!");
  } catch (error) {
    console.error("Error during builds import:", error);
  } finally {
    await db.close();
    process.exit(0);
  }
}

importData();
