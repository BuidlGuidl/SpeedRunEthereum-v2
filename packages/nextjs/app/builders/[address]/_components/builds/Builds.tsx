"use client";

import Link from "next/link";
import { BuildCard } from "./BuildCard";
import { BuildIdeas } from "./BuildIdeas";
import { SubmitNewBuildButton } from "./SubmitNewBuildButton";
import { useAccount } from "wagmi";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Build } from "~~/services/database/repositories/builds";

type BuildByUser = {
  ownerAddress: string;
  build: Build;
  likes: string[];
  coBuilders: string[];
};

export function Builds({
  address,
  builds,
  userHasCompletedChallenges,
  buildIdeas,
}: {
  address: string;
  builds: BuildByUser[];
  userHasCompletedChallenges: boolean;
  buildIdeas: { name: string; description: string; imageUrl?: string }[];
}) {
  const { address: connectedAddress } = useAccount();

  const isProfileOwner = connectedAddress?.toLowerCase() === address.toLowerCase();
  const hasBuilds = builds.length > 0;

  if (!hasBuilds && !isProfileOwner) {
    return null;
  }

  return (
    <div className="mt-20">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold mb-0 text-neutral">Builds</h2>
          <Link href="/build-prompts" className="flex items-center gap-1 text-sm text-primary link">
            <SparklesIcon className="w-4 h-4" />
            Build Prompts
          </Link>
        </div>
        <SubmitNewBuildButton isProfileOwner userHasCompletedChallenges={userHasCompletedChallenges} />
      </div>
      <div className="p-6 bg-base-100 rounded-lg">
        {hasBuilds && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {builds.map(build => (
              <div key={build.build.id} className="flex-grow-0 flex-shrink-0">
                <BuildCard
                  ownerAddress={build.ownerAddress}
                  build={build.build}
                  likes={build.likes}
                  coBuilders={build.coBuilders}
                />
              </div>
            ))}
          </div>
        )}
        {!hasBuilds && isProfileOwner && <BuildIdeas buildIdeas={buildIdeas} />}
      </div>
    </div>
  );
}
