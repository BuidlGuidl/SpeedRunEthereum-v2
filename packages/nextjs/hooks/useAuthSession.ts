import { UseSessionOptions, useSession } from "next-auth/react";

export const useAuthSession = <R extends boolean>(options?: UseSessionOptions<R>) => {
  const sessionData = useSession(options);

  const isAdmin = sessionData?.data?.user?.role === "admin";
  const userAddress = sessionData?.data?.user?.userAddress;
  const isAuthenticated = sessionData.status === "authenticated";

  return { ...sessionData, isAdmin, userAddress, isAuthenticated };
};
