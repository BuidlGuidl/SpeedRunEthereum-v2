import { db } from "../config/postgresClient";
import { buildBuilders, buildLikes } from "../config/schema";
import { eq, inArray } from "drizzle-orm";

// Fetch all builds for a given user address, including cobuilders and likes for each build
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

  // Fetch all likes for these builds
  const allLikes = await db.query.buildLikes.findMany({
    where: inArray(buildLikes.buildId, buildIds),
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

  // Group likes by buildId
  const likesByBuildId = allLikes.reduce(
    (acc, like) => {
      if (!acc[like.buildId]) acc[like.buildId] = [];
      acc[like.buildId].push({ userAddress: like.userAddress, likedAt: like.likedAt });
      return acc;
    },
    {} as Record<string, { userAddress: string; likedAt: Date }[]>,
  );

  // Attach cobuilders and likes to each build
  return buildsList.map(build => ({
    ...build,
    cobuilders: cobuildersByBuildId[build.id] || [],
    likes: likesByBuildId[build.id] || [],
  }));
}
