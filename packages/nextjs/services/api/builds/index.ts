import { Build } from "~~/services/database/repositories/builds";

export const getAllFilteredBuilds = async ({ name }: { name?: string }) => {
  const response = await fetch(`/api/builds/all-builds?name=${name}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch all builds: ${response.status} ${response.statusText}`);
  }

  const buildsData = (await response.json()) as Build[];

  return buildsData;
};
