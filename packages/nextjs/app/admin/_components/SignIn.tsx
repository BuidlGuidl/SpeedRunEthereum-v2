"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAuthSession } from "~~/hooks/useAuthSession";

export const SignIn = () => {
  const { openConnectModal } = useConnectModal();
  const { isAuthenticated } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.refresh();
    }
  }, [router, isAuthenticated]);

  return (
    <div className="flex flex-col items-center px-4 py-10 sm:py-20">
      <h1 className="text-3xl text-center font-extrabold mb-1">Sign In</h1>
      <p className="mb-6">You need to sign in to access the admin dashboard.</p>
      <button className="btn btn-primary" onClick={openConnectModal}>
        Sign in with Ethereum
      </button>
    </div>
  );
};
