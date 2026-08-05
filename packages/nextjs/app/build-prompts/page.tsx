import { BuildPrompts } from "./_components/BuildPrompts";
import { getAllBuildPrompts } from "~~/services/build-prompts";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { getTopLevelPageStructuredData } from "~~/utils/structuredData";

const TITLE = "Build Prompts";
const DESCRIPTION =
  "Free, AI-ready project specs from Speedrun Ethereum. Pick a build, copy the prompt into your AI, and customize the parameters to scaffold a working dApp on Scaffold-ETH 2.";

export const metadata = getMetadata({
  title: TITLE,
  description: DESCRIPTION,
  imageRelativePath: "/build-prompts-thumbnail.png",
  path: "/build-prompts",
});

const structuredData = getTopLevelPageStructuredData({
  type: "CollectionPage",
  path: "/build-prompts",
  title: TITLE,
  description: DESCRIPTION,
  breadcrumbName: "Build Prompts",
});

export default function BuildPromptsPage() {
  const prompts = getAllBuildPrompts();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <BuildPrompts prompts={prompts} />
    </>
  );
}
