import { UseSessionOptions, useSession } from "next-auth/react";
import { UserRole } from "~~/services/database/config/types";

export const useAuthSession = <R extends boolean>(options?: UseSessionOptions<R>) => {
  const sessionData = useSession(options);

  const isAdmin = sessionData?.data?.user?.role === UserRole.ADMIN;
  const userAddress = sessionData?.data?.user?.userAddress;
  const isAuthenticated = sessionData.status === "authenticated";

  return { ...sessionData, isAdmin, userAddress, isAuthenticated };
};
