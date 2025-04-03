"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const RouteRefresher = () => {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  return null;
};
