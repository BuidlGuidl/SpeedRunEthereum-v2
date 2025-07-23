"use client";

import { BuildCard } from "./BuildCard";
import { BuildIdeas } from "./BuildIdeas";
import { SubmitNewBuildButton } from "./SubmitNewBuildButton";
import { useAccount } from "wagmi";
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
}: {
  address: string;
  builds: BuildByUser[];
  userHasCompletedChallenges: boolean;
}) {
  const { address: connectedAddress } = useAccount();

  const isOwner = connectedAddress === address;
  const hasBuilds = builds.length > 0;

  if (!hasBuilds && !isOwner) {
    return null;
  }

  return (
    <div className="mt-20">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-0 text-neutral">Builds</h2>
        <SubmitNewBuildButton isOwner={isOwner} userHasCompletedChallenges={userHasCompletedChallenges} />
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
        {!hasBuilds && isOwner && <BuildIdeas />}
      </div>
    </div>
  );
}
