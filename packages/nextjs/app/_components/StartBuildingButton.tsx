"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePlausible } from "next-plausible";

export const StartBuildingButton = () => {
  const plausible = usePlausible();

  const handleCtaClick = useCallback(() => {
    plausible("cta");
  }, [plausible]);

  return (
    <Link
      href="/start"
      onClick={handleCtaClick}
      className="mt-4 px-6 py-3 text-lg font-medium text-content bg-accent border-[3px] border-primary rounded-full hover:bg-accent-content hover:border-base-300 hover:text-base-300 dark:bg-base-200 transition-colors"
    >
      Start Building on Ethereum
    </Link>
  );
};
