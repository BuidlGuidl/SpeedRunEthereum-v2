import { BuildPrompts } from "./_components/BuildPrompts";
import { getAllBuildPrompts } from "~~/services/build-prompts";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Build Prompts",
  description:
    "Full project specs for AI coding agents. Pick a build, copy the prompt into your AI, and customize the parameters to scaffold a working dApp on Scaffold-ETH 2.",
});

export default function BuildPromptsPage() {
  const prompts = getAllBuildPrompts();
  return <BuildPrompts prompts={prompts} />;
}
