import { AllBuilds } from "./_components/AllBuilds";
import { BuildCategory, BuildType } from "~~/services/database/config/types";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "All Builds",
  description: "View all the builds by the Speed Run Ethereum community",
});

export default async function AllBuildsPage(props: {
  searchParams: Promise<{ category?: BuildCategory; type?: BuildType }>;
}) {
  const searchParams = await props.searchParams;
  return <AllBuilds searchParams={searchParams} />;
}
