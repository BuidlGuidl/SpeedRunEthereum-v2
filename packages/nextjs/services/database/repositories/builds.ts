import { BuildCategory, BuildType } from "../config/types";
import { filterValidUserAddresses } from "./users";
import { InferInsertModel, InferSelectModel, and, eq, ilike, inArray } from "drizzle-orm";
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
  const [insertedBuild] = await db.insert(builds).values(build).returning();

  if (!insertedBuild) {
    throw new Error("Failed to create build");
  }

  // Insert the build builder
  const [insertedBuildBuilder] = await db
    .insert(buildBuilders)
    .values({
      buildId: insertedBuild.id,
      userAddress: build.userAddress,
      isOwner: true,
    })
    .returning();

  if (build.coBuilders && build.coBuilders.length > 0) {
    // Only insert co-builders that exist in the users table
    const validCoBuilders = await filterValidUserAddresses(build.coBuilders);
    if (validCoBuilders.length > 0) {
      await db.insert(buildBuilders).values(
        validCoBuilders.map(userAddress => ({
          buildId: insertedBuild.id,
          userAddress,
          isOwner: false,
        })),
      );
    }
  }

  return { insertedBuild, insertedBuildBuilder };
};

export const isOwnerOfBuild = async (buildId: string, userAddress: string) => {
  const [buildBuilder] = await db
    .select()
    .from(buildBuilders)
    .where(and(eq(buildBuilders.buildId, buildId), eq(buildBuilders.userAddress, userAddress)));
  return buildBuilder?.isOwner;
};

export const updateBuild = async (buildId: string, build: BuildInsert) => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    submittedTimestamp, // ignore this field
    coBuilders,
    userAddress,
    ...updatableFields
  } = build;

  return await db.transaction(async trx => {
    // Update the build
    const [updatedBuild] = await trx.update(builds).set(updatableFields).where(eq(builds.id, buildId)).returning();

    if (!updatedBuild) {
      throw new Error("Failed to update build");
    }

    // Remove all existing builders for this build
    await trx.delete(buildBuilders).where(eq(buildBuilders.buildId, updatedBuild.id));

    // Prepare all builders (owner + co-builders)
    let validCoBuilders: string[] = [];
    if (coBuilders && coBuilders.length > 0) {
      validCoBuilders = await filterValidUserAddresses(coBuilders);
    }

    const buildersToInsert = [
      {
        buildId: updatedBuild.id,
        userAddress,
        isOwner: true,
      },
      ...validCoBuilders.map(coBuilderAddress => ({
        buildId: updatedBuild.id,
        userAddress: coBuilderAddress,
        isOwner: false,
      })),
    ];

    await trx.insert(buildBuilders).values(buildersToInsert);

    return updatedBuild;
  });
};

export const getBuildsByUserAddress = async (userAddress: string) => {
  const normalizedAddress = userAddress.toLowerCase();

  // 1. Get all build IDs where the user is a builder (owner or co-builder)
  const userBuildRows = await db
    .select({ buildId: buildBuilders.buildId })
    .from(buildBuilders)
    .where(eq(lower(buildBuilders.userAddress), normalizedAddress));

  const buildIds = userBuildRows.map(row => row.buildId);
  if (buildIds.length === 0) return [];

  // 2. Fetch all builds, builders, and likes for these IDs in parallel
  const [buildsRows, buildersRows, likesRows] = await Promise.all([
    db.select().from(builds).where(inArray(builds.id, buildIds)),
    db
      .select({
        buildId: buildBuilders.buildId,
        userAddress: buildBuilders.userAddress,
        isOwner: buildBuilders.isOwner,
      })
      .from(buildBuilders)
      .where(inArray(buildBuilders.buildId, buildIds)),
    db
      .select({
        buildId: buildLikes.buildId,
        userAddress: buildLikes.userAddress,
      })
      .from(buildLikes)
      .where(inArray(buildLikes.buildId, buildIds)),
  ]);

  // 3. Group builders and likes by buildId using reduce
  const buildIdToBuilders = buildersRows.reduce(
    (acc, row) => {
      if (!acc[row.buildId]) acc[row.buildId] = { owner: "", coBuilders: [] };
      if (row.isOwner) acc[row.buildId].owner = row.userAddress;
      else acc[row.buildId].coBuilders.push(row.userAddress);
      return acc;
    },
    {} as Record<string, { owner: string; coBuilders: string[] }>,
  );

  const buildIdToLikes = likesRows.reduce(
    (acc, row) => {
      if (!acc[row.buildId]) acc[row.buildId] = [];
      acc[row.buildId].push(row.userAddress);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  // 4. Assemble the result
  return buildsRows.map(build => ({
    build,
    ownerAddress: buildIdToBuilders[build.id]?.owner || "",
    coBuilders: buildIdToBuilders[build.id]?.coBuilders || [],
    likes: buildIdToLikes[build.id] || [],
  }));
};

export const deleteBuild = async (buildId: string) => {
  await db.transaction(async trx => {
    // Delete likes
    await trx.delete(buildLikes).where(eq(buildLikes.buildId, buildId));
    // Delete builders
    await trx.delete(buildBuilders).where(eq(buildBuilders.buildId, buildId));
    // Delete the build itself
    await trx.delete(builds).where(eq(builds.id, buildId));
  });
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

export const getBuildByBuildId = async (buildId: string) => {
  const build = await db.query.builds.findFirst({
    where: eq(builds.id, buildId),
    with: {
      builders: true,
      likes: true,
    },
  });
  return build;
};

export const getAllBuilds = async ({
  category,
  type,
  nameSearch,
}: {
  category?: BuildCategory;
  type?: BuildType;
  nameSearch?: string;
}) => {
  const results = await db.query.builds.findMany({
    where: and(
      category ? eq(builds.buildCategory, category) : undefined,
      type ? eq(builds.buildType, type) : undefined,
      nameSearch ? ilike(builds.name, `%${nameSearch}%`) : undefined,
    ),
    with: {
      likes: true,
    },
    orderBy: (builds, { desc, sql }) => [desc(sql`(SELECT COUNT(*) FROM build_likes WHERE build_id = ${builds.id})`)],
    limit: 48,
  });

  return results;
};
