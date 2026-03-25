import { BuildPrompts } from "./_components/BuildPrompts";
import { getAllBuildPrompts } from "~~/services/build-prompts";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

// TODO: Revert this hardcoded URL before merging to production
const buildPromptsMetadata = getMetadata({
  title: "Build Prompts",
  description:
    "Full project specs for AI coding agents. Pick a build, copy the prompt into your AI, and customize the parameters to scaffold a working dApp on Scaffold-ETH 2.",
  imageRelativePath: "/build-prompts-thumbnail.png",
});

export const metadata = {
  ...buildPromptsMetadata,
  metadataBase: new URL("https://speedrunethereum-v2-git-build-prompts-page-v3-buidlguidldao.vercel.app"),
  openGraph: {
    ...buildPromptsMetadata.openGraph,
    images: [
      {
        url: "https://speedrunethereum-v2-git-build-prompts-page-v3-buidlguidldao.vercel.app/build-prompts-thumbnail.png",
      },
    ],
  },
  twitter: {
    ...buildPromptsMetadata.twitter,
    images: [
      "https://speedrunethereum-v2-git-build-prompts-page-v3-buidlguidldao.vercel.app/build-prompts-thumbnail.png",
    ],
  },
};

export default function BuildPromptsPage() {
  const prompts = getAllBuildPrompts();
  return <BuildPrompts prompts={prompts} />;
}
