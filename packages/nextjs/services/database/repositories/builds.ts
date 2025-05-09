import { InferInsertModel, InferSelectModel, and, eq } from "drizzle-orm";
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

export const getBuildsByUserAddress = async (userAddress: string) => {
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
    .where(and(eq(lower(buildBuilders.userAddress), userAddress.toLowerCase()), eq(buildBuilders.isOwner, true)));

  const result = rows.reduce<Record<string, { build: Build; coBuilders: Set<string>; likes: Set<string> }>>(
    (acc, row) => {
      const buildId = row.build.id;
      if (!acc[buildId]) {
        acc[buildId] = { build: row.build, coBuilders: new Set(), likes: new Set() };
      }
      if (row.builderUserAddress && !row.builderIsOwner) {
        acc[buildId].coBuilders.add(row.builderUserAddress);
      }
      if (row.likeUserAddress) {
        acc[buildId].likes.add(row.likeUserAddress);
      }
      return acc;
    },
    {},
  );

  return Object.values(result).map(({ build, coBuilders, likes }) => ({
    build,
    coBuilders: Array.from(coBuilders),
    likes: Array.from(likes),
  }));
};
