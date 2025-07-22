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

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-0 text-neutral pb-4">Builds</h2>
        <SubmitNewBuildButton />
      </div>
      {hasBuilds && (
        <div className="flex flex-wrap items-stretch w-full gap-5">
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
        <div className="flex flex-col items-center justify-center w-full h-full">
          <p className="text-lg font-medium text-neutral">No builds yet</p>
          <SubmitNewBuildButton />
        </div>
      )}
    </>
  );
}
