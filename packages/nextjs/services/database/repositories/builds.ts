import { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { builds } from "~~/services/database/config/schema";

export type BuildInsert = InferInsertModel<typeof builds>;

export const createBuild = (build: BuildInsert) => {
  return db.insert(builds).values(build).returning();
};
