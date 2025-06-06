import { BuildCategory, BuildType } from "~~/services/database/config/types";
import { Build } from "~~/services/database/repositories/builds";

export const getAllFilteredBuilds = async ({
  category,
  type,
  name,
}: {
  category?: BuildCategory;
  type?: BuildType;
  name?: string;
}) => {
  const params = new URLSearchParams();
  if (name) params.append("name", name);
  if (category) params.append("category", category);
  if (type) params.append("type", type);
  const response = await fetch(`/api/builds/all-builds?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch all builds: ${response.status} ${response.statusText}`);
  }

  const buildsData = (await response.json()) as Array<Build & { likes: Array<{ userAddress: string }> }>;

  return buildsData;
};
