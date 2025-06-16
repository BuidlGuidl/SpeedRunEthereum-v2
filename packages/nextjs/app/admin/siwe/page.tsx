"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SIWEPage() {
  const router = useRouter();
  // To prevent double back navigation
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.back();
    }
  }, [router]);

  return null;
}
