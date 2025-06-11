import { AllBuilds } from "./_components/AllBuilds";
import { BuildCategory, BuildType } from "~~/services/database/config/types";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "All Builds",
  description: "View all the builds by the Speed Run Ethereum community",
});

export default async function AllBuildsPage({
  searchParams,
}: {
  searchParams: { category?: BuildCategory; type?: BuildType };
}) {
  return <AllBuilds searchParams={searchParams} />;
}
