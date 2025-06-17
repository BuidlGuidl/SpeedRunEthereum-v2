import { BuildCategory, BuildType } from "~~/services/database/config/types";
import { Build } from "~~/services/database/repositories/builds";

export const fetchBuilds = async ({
  category,
  type,
  name,
  start,
}: {
  category?: BuildCategory;
  type?: BuildType;
  name?: string;
  start?: number;
}) => {
  const params = new URLSearchParams();
  if (name) params.append("name", name);
  if (category) params.append("category", category);
  if (type) params.append("type", type);
  if (start) params.append("start", start.toString());
  const response = await fetch(`/api/builds?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch all builds: ${response.status} ${response.statusText}`);
  }

  const buildsData = (await response.json()) as Array<Build & { likes: Array<{ userAddress: string }> }>;

  return buildsData;
};
