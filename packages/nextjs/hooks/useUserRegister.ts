import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useSignatureWithNotification } from "~~/hooks/useSignatureWithNotification";
import { registerUser } from "~~/services/api/users";
import { EIP_712_TYPED_DATA__USER_REGISTER } from "~~/services/eip712/register";
import { notification } from "~~/utils/scaffold-eth";

export function useUserRegister() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { signWithNotification } = useSignatureWithNotification();

  const { mutateAsync: userLocationMutation, isPending: isRegistering } = useMutation({
    mutationFn: async ({
      referrer,
      originalUtmParams,
      eventTrigger,
    }: {
      referrer: string | null;
      originalUtmParams?: Record<string, string>;
      eventTrigger?: string;
    }) => {
      if (!address) throw new Error("Wallet not connected");

      const signature = await signWithNotification(EIP_712_TYPED_DATA__USER_REGISTER);

      const eventPath = typeof window !== "undefined" ? window.location.pathname : undefined;

      return registerUser({
        address,
        signature,
        referrer,
        originalUtmParams,
        eventPath,
        eventTrigger,
      });
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
