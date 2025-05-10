"use client";

import { SignIn } from "../admin/_components/SignIn";
import { Session } from "next-auth";
import { useAccount } from "wagmi";
import { useUser } from "~~/hooks/useUser";
import { UserRole } from "~~/services/database/config/types";

export default function AdminSiwe({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const { address: connectedAddress } = useAccount();
  const { data: user } = useUser(connectedAddress);

  if (user?.role === UserRole.ADMIN && !session?.user) {
    return <SignIn />;
  }

  return children;
}
