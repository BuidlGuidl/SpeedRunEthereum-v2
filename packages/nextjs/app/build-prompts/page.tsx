import { BuildPrompts } from "./_components/BuildPrompts";
import { getAllBuildPrompts } from "~~/services/build-prompts";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Build Prompts",
  description: "Browse AI-ready prompts for Ethereum build ideas using Scaffold-ETH 2",
});

export default function BuildPromptsPage() {
  const prompts = getAllBuildPrompts();
  return <BuildPrompts prompts={prompts} />;
}
