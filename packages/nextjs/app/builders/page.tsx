import { BuildersTable } from "./_components/BuildersTable";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "All Builders",
  description: "View the builders participating in Speedrun Ethereum.",
  canonicalPath: "/builders",
  robots: { index: false, follow: true },
});

export default function BuildersPage() {
  return <BuildersTable />;
}
