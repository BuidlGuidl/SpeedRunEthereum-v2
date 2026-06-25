"use client";

import type { ReactNode } from "react";

export function Details({ children }: { children?: ReactNode }) {
  return <details className="my-4">{children}</details>;
}

export function Summary({ children }: { children?: ReactNode }) {
  return <summary className="cursor-pointer font-semibold">{children}</summary>;
}
