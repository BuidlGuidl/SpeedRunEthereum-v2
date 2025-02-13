import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { fetchUser, registerUser } from "~~/services/api/users";
import { notification } from "~~/utils/scaffold-eth";

export function useUser() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", address],
    queryFn: () => fetchUser(address),
    enabled: Boolean(address) && isConnected,
  });

  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: registerUser,
    onSuccess: user => {
      queryClient.setQueryData(["user", address], user);
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
