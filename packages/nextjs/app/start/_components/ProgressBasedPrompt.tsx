"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useUserChallenges } from "~~/hooks/useUserChallenges";

export const ProgressBasedPrompt = () => {
  const { address: connectedAddress } = useAccount();

  const { data: userChallenges } = useUserChallenges(connectedAddress);

  const hasStartedChallenges = Boolean(userChallenges?.length);

  return (
    <div className="mb-8 mx-auto w-80 h-40 bg-[url('/assets/start/window-1.svg')] bg-center bg-no-repeat lg:mb-0 lg:absolute lg:right-[5%] lg:-bottom-20">
      <div className="pt-14 px-10 text-gray-600 md:pt-[3.25rem]">
        {hasStartedChallenges ? (
          <>
            <p className="mt-0 mb-1 text-center lg:text-left md:text-lg">Already started your journey?</p>
            <Link href={`/builders/${connectedAddress}`} className="link">
              Continue from your Portfolio
            </Link>
          </>
        ) : (
          <>
            <p className="mt-0 mb-1 text-center lg:text-left md:text-lg">Already comfortable building on Ethereum?</p>
            <Link href="/challenge/tokenization" className="link">
              Jump straight to the first challenge
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
