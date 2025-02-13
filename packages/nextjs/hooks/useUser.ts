import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "~~/services/api/users";

export function useUser(address: string | undefined) {
  return useQuery({
    queryKey: ["user", address],
    queryFn: () => fetchUser(address),
    enabled: Boolean(address),
  });
}
