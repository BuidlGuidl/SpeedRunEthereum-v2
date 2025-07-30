"use client";

import Link from "next/link";
import type { MappedChallenges } from "./GroupedChallenges";
import type { Address } from "viem";
import { useAccount } from "wagmi";

export function ChallengeDetails({
  address,
  challenge,
  comingSoon,
}: {
  address: Address;
  challenge: MappedChallenges;
  comingSoon?: boolean;
}) {
  const { address: connectedAddress } = useAccount();
  const isProfileOwner = connectedAddress?.toLowerCase() === address.toLowerCase();

  const shortedDescription = challenge.description.split(".")[0];

  return (
    <div className="text-base-content/50 hover:text-base-content transition">
      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="m-0 font-medium">
              <Link href={`/challenge/${challenge.id}`} className="hover:underline">
                {challenge.challengeName}
              </Link>
              {comingSoon && ` - Coming Soon`}
            </h2>
          </div>
          <div>
            <p className="mt-2 mb-0 text-sm">{shortedDescription}.</p>
          </div>
        </div>

        {isProfileOwner && (
          <Link href={`/challenge/${challenge.id}`} className="btn btn-primary btn-sm rounded-md">
            Start
          </Link>
        )}
      </div>
    </div>
  );
}
