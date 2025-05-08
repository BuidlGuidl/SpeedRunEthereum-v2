import { db } from "../config/postgresClient";
import { buildBuilders } from "../config/schema";
import { eq, inArray } from "drizzle-orm";

// Fetch all builds for a given user address, including cobuilders for each build
export async function getBuildsByUserAddress(userAddress: string) {
  // Find all buildBuilders for this user
  const builderRows = await db.query.buildBuilders.findMany({
    where: eq(buildBuilders.userAddress, userAddress),
  });
  const buildIds = builderRows.map(row => row.buildId);
  if (buildIds.length === 0) return [];

  // Fetch all builds for these buildIds
  const buildsList = await db.query.builds.findMany({
    where: (builds, { inArray }) => inArray(builds.id, buildIds),
  });

  // Fetch all cobuilders for these builds
  const allCobuilders = await db.query.buildBuilders.findMany({
    where: inArray(buildBuilders.buildId, buildIds),
  });

  // Group cobuilders by buildId
  const cobuildersByBuildId = allCobuilders.reduce(
    (acc, builder) => {
      if (!acc[builder.buildId]) acc[builder.buildId] = [];
      acc[builder.buildId].push({ userAddress: builder.userAddress, isOwner: builder.isOwner });
      return acc;
    },
    {} as Record<string, { userAddress: string; isOwner: boolean }[]>,
  );

  // Attach cobuilders to each build
  return buildsList.map(build => ({
    ...build,
    cobuilders: cobuildersByBuildId[build.id] || [],
  }));
}
