import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { UserByAddress } from "~~/services/database/respositories/users";
import { notification } from "~~/utils/scaffold-eth";

async function fetchUser(address: string | undefined) {
  if (!address) return null;

  const response = await fetch(`/api/users/${address}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch user");
  }
  const data = await response.json();
  return data.user;
}

async function registerUser({ address, signature }: { address: string; signature: string }) {
  console.log("registerUser", address, signature);
  const response = await fetch("/api/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, signature }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Registration failed");
  }

  return response.json();
}

export function useUser() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<UserByAddress>({
    queryKey: ["user", address],
    queryFn: () => fetchUser(address),
    enabled: Boolean(address) && isConnected,
  });

  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: registerUser,
    onSuccess: data => {
      queryClient.setQueryData(["user", address], data.user);
      notification.success("Successfully registered!");
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      notification.error(error.message || "Failed to register. Please try again.");
    },
  });

  return {
    user,
    isLoading,
    register,
    isRegistering,
  };
}
