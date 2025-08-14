import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { registerUser } from "~~/services/api/users";
import { EIP_712_TYPED_DATA__USER_REGISTER } from "~~/services/eip712/register";
import { notification } from "~~/utils/scaffold-eth";

export function useUserRegister() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutateAsync: userLocationMutation, isPending: isRegistering } = useMutation({
    mutationFn: async ({
      referrer,
      originalUtmParams,
    }: {
      referrer: string | null;
      originalUtmParams?: Record<string, string>;
    }) => {
      if (!address) throw new Error("Wallet not connected");

      let signature: `0x${string}` | undefined;
      const loadingNotificationId = notification.loading("Awaiting for Wallet signature...");
      try {
        signature = await signTypedDataAsync(EIP_712_TYPED_DATA__USER_REGISTER);
      } finally {
        notification.remove(loadingNotificationId);
      }

      return registerUser({ address, signature, referrer, originalUtmParams });
    },
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
    handleRegister: userLocationMutation,
    isRegistering,
  };
}
