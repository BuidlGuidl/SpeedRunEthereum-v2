"use client";

import { BuildCard } from "./BuildCard";
import { SubmitNewBuildButton } from "./SubmitNewBuildButton";
import { useAccount } from "wagmi";
import { Build } from "~~/services/database/repositories/builds";

type BuildByUser = {
  ownerAddress: string;
  build: Build;
  likes: string[];
  coBuilders: string[];
};

export function Builds({ address, builds }: { address: string; builds: BuildByUser[] }) {
  const { address: connectedAddress } = useAccount();

  const isOwner = connectedAddress === address;
  const hasBuilds = builds.length > 0;

  if (!hasBuilds && !isOwner) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-0 text-neutral pb-4">Builds</h2>
        <SubmitNewBuildButton />
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
        {!hasBuilds && isOwner && (
          <div>
            <p className="m-0">
              <strong>You currently have no builds.</strong> Take a look at some recommended build ideas:
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
