"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePlausible } from "next-plausible";

export const StartBuildingButton = () => {
  const plausible = usePlausible();

  // TODO: test this later
  const handleCtaClick = useCallback(() => {
    plausible("cta");
  }, [plausible]);

  return (
    <Link
      href="/start"
      onClick={handleCtaClick}
      className="mt-4 px-6 py-3 text-lg font-medium text-white bg-primary rounded-full hover:bg-secondary-content dark:text-gray-800 transition-colors"
    >
      Start Building on Ethereum
    </Link>
  );
};
