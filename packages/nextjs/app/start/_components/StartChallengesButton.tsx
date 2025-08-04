"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePlausible } from "next-plausible";

export const StartChallengesButton = () => {
  const plausible = usePlausible();

  const handleCtaClick = useCallback(() => {
    plausible("cta_from_start");
  }, [plausible]);

  return (
    <Link
      href="/challenge/simple-nft-example"
      onClick={handleCtaClick}
      className="px-12 py-4 text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-cover transition-transform duration-200 ease-in-out hover:scale-105"
    >
      Start Challenge #0
    </Link>
  );
};
