"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useDisconnect } from "wagmi";

export const AccessDenied = () => {
  const { disconnect } = useDisconnect();
  return (
    <div className="flex flex-col items-center px-4 py-10 sm:py-20">
      <h1 className="text-3xl text-center font-extrabold mb-1">Access Denied</h1>
      <p className="mb-6">You are not authorized to access this page.</p>
      <div className="flex space-x-2">
        <Link href="/">
          <button className="btn btn-ghost border-2 border-primary">Go to Home</button>
        </Link>
        <button
          className="btn btn-primary border-2 border-primary"
          onClick={() => {
            disconnect();
            signOut();
          }}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};
