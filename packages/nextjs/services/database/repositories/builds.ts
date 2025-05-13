import { InferInsertModel, InferSelectModel, and, eq, inArray } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { buildBuilders, buildLikes, builds, lower } from "~~/services/database/config/schema";

export type Build = InferSelectModel<typeof builds>;
export type BuildLike = InferSelectModel<typeof buildLikes>;

export type BuildInsert = InferInsertModel<typeof builds> &
  Omit<InferInsertModel<typeof buildBuilders>, "buildId"> & {
    coBuilders?: string[];
  };

export const createBuild = async (build: BuildInsert) => {
  // Insert the build
  const [insertdBuild] = await db.insert(builds).values(build).returning();

  if (!insertdBuild) {
    throw new Error("Failed to create build");
  }

  // Insert the build builder
  const [insertedBuildBuilder] = await db
    .insert(buildBuilders)
    .values({
      buildId: insertdBuild.id,
      userAddress: build.userAddress,
      isOwner: true,
    })
    .returning();

  if (build.coBuilders && build.coBuilders.length > 0) {
    // Insert the co-builders
    await db.insert(buildBuilders).values(
      build.coBuilders.map(userAddress => ({
        buildId: insertdBuild.id,
        userAddress,
        isOwner: false,
      })),
    );
  }

  return { insertdBuild, insertedBuildBuilder };
};

export const isOwnerOfBuild = async (buildId: string, userAddress: string) => {
  const [buildBuilder] = await db
    .select()
    .from(buildBuilders)
    .where(and(eq(buildBuilders.buildId, buildId), eq(buildBuilders.userAddress, userAddress)));
  return buildBuilder?.isOwner;
};

export const updateBuild = async (buildId: string, build: BuildInsert) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { submittedTimestamp, ...restBuild } = build;
  const [updatedBuild] = await db.update(builds).set(restBuild).where(eq(builds.id, buildId)).returning();

  if (!updatedBuild) {
    throw new Error("Failed to update build");
  }

  // Remove all existing builders for this build
  await db.delete(buildBuilders).where(eq(buildBuilders.buildId, updatedBuild.id));

  // Insert the owner
  await db.insert(buildBuilders).values({
    buildId: updatedBuild.id,
    userAddress: build.userAddress,
    isOwner: true,
  });

  // Insert co-builders (if any)
  if (build.coBuilders && build.coBuilders.length > 0) {
    await db.insert(buildBuilders).values(
      build.coBuilders.map(userAddress => ({
        buildId: updatedBuild.id,
        userAddress,
        isOwner: false,
      })),
    );
  }

  return updatedBuild;
};

export const getBuildsByUserAddress = async (userAddress: string) => {
  // Step 1: Fetch all builds where the user is a builder (owner or not)
  const rows = await db
    .select({
      build: builds,
      builderUserAddress: buildBuilders.userAddress,
      builderIsOwner: buildBuilders.isOwner,
      likeUserAddress: buildLikes.userAddress,
    })
    .from(builds)
    .innerJoin(buildBuilders, eq(builds.id, buildBuilders.buildId))
    .leftJoin(buildLikes, eq(builds.id, buildLikes.buildId))
    .where(eq(lower(buildBuilders.userAddress), userAddress.toLowerCase()));

  // Get unique build IDs
  const buildIds = Array.from(new Set(rows.map(row => row.build.id)));
  if (buildIds.length === 0) return [];

  // Step 2: Fetch all builder addresses for these build IDs
  const allBuilders = await db
    .select({
      buildId: buildBuilders.buildId,
      userAddress: buildBuilders.userAddress,
    })
    .from(buildBuilders)
    .where(inArray(buildBuilders.buildId, buildIds));

  // Map buildId to all builder addresses
  const buildIdToBuilders = allBuilders.reduce<Record<string, Set<string>>>((acc, row) => {
    if (!acc[row.buildId]) acc[row.buildId] = new Set();
    acc[row.buildId].add(row.userAddress);
    return acc;
  }, {});

  // Map buildId to owner address
  const buildIdToOwner: Record<string, string> = {};
  rows.forEach(row => {
    if (row.builderIsOwner) {
      buildIdToOwner[row.build.id] = row.builderUserAddress;
    }
  });

  // Step 3: Reduce the original rows to build the result
  const result = rows.reduce<Record<string, { build: Build; likes: Set<string> }>>((acc, row) => {
    const buildId = row.build.id;
    if (!acc[buildId]) {
      acc[buildId] = { build: row.build, likes: new Set() };
    }
    if (row.likeUserAddress) {
      acc[buildId].likes.add(row.likeUserAddress);
    }
    return acc;
  }, {});

  // Step 4: Return builds with all builder addresses as coBuilders, excluding the owner
  return Object.entries(result).map(([buildId, { build, likes }]) => ({
    build,
    coBuilders: Array.from(buildIdToBuilders[buildId] || []).filter(addr => addr !== buildIdToOwner[buildId]),
    likes: Array.from(likes),
  }));
};

export const deleteBuild = async (buildId: string) => {
  // Delete likes
  await db.delete(buildLikes).where(eq(buildLikes.buildId, buildId));
  // Delete builders
  await db.delete(buildBuilders).where(eq(buildBuilders.buildId, buildId));
  // Delete the build itself
  await db.delete(builds).where(eq(builds.id, buildId));
};
