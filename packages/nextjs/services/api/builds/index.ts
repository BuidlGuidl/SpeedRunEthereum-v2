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
  const response = await fetch(
    `/api/builds/all-builds?name=${name}${category ? `&category=${category}` : ""}${type ? `&type=${type}` : ""}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch all builds: ${response.status} ${response.statusText}`);
  }

  const buildsData = (await response.json()) as Build[];

  return buildsData;
};
