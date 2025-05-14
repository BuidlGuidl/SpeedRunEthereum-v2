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
  const normalizedAddress = userAddress.toLowerCase();

  const userBuildRows = await db
    .select({ buildId: buildBuilders.buildId })
    .from(buildBuilders)
    .where(eq(lower(buildBuilders.userAddress), normalizedAddress));

  const buildIds = userBuildRows.map(row => row.buildId);
  if (buildIds.length === 0) return [];

  const buildsRows = await db.select().from(builds).where(inArray(builds.id, buildIds));

  const buildersRows = await db
    .select({
      buildId: buildBuilders.buildId,
      userAddress: buildBuilders.userAddress,
      isOwner: buildBuilders.isOwner,
    })
    .from(buildBuilders)
    .where(inArray(buildBuilders.buildId, buildIds));

  const likesRows = await db
    .select({
      buildId: buildLikes.buildId,
      userAddress: buildLikes.userAddress,
    })
    .from(buildLikes)
    .where(inArray(buildLikes.buildId, buildIds));

  const buildIdToBuilders = new Map<string, { owner: string; coBuilders: string[] }>();
  for (const row of buildersRows) {
    let builderEntry = buildIdToBuilders.get(row.buildId);
    if (!builderEntry) {
      builderEntry = { owner: "", coBuilders: [] };
      buildIdToBuilders.set(row.buildId, builderEntry);
    }
    if (row.isOwner) {
      builderEntry.owner = row.userAddress;
    } else {
      builderEntry.coBuilders.push(row.userAddress);
    }
  }

  const buildIdToLikes = new Map<string, string[]>();
  for (const row of likesRows) {
    let likesEntry = buildIdToLikes.get(row.buildId);
    if (!likesEntry) {
      likesEntry = [];
      buildIdToLikes.set(row.buildId, likesEntry);
    }
    likesEntry.push(row.userAddress);
  }

  return buildsRows.map(build => ({
    build,
    ownerAddress: buildIdToBuilders.get(build.id)?.owner || "",
    coBuilders: buildIdToBuilders.get(build.id)?.coBuilders || [],
    likes: buildIdToLikes.get(build.id) || [],
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

export const getBuildLikeForUser = async (buildId: string, userAddress: string) => {
  const like = await db.query.buildLikes.findFirst({
    where: and(eq(buildLikes.buildId, buildId), eq(buildLikes.userAddress, userAddress)),
  });
  return like;
};

export const createBuildLike = async (buildId: string, userAddress: string) => {
  const [like] = await db.insert(buildLikes).values({ buildId, userAddress }).returning();
  return like;
};

export const deleteBuildLike = async (likeId: number) => {
  await db.delete(buildLikes).where(eq(buildLikes.id, likeId));
};
