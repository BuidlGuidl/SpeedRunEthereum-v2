import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { registerUser } from "~~/services/api/users";
import { EIP_712_TYPED_DATA__USER_REGISTER } from "~~/services/eip712/register";
import { notification } from "~~/utils/scaffold-eth";

export function useUserRegister() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { signTypedDataAsync } = useSignTypedData();

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

  const handleRegister = async (referrer: string | null, originalUtmParams?: Record<string, string>) => {
    if (!address) return;

    try {
      const loadingNotificationId = notification.loading("Awaiting for Wallet signature...");
      const signature = await signTypedDataAsync(EIP_712_TYPED_DATA__USER_REGISTER);
      notification.remove(loadingNotificationId);

      register({ address, signature, referrer, originalUtmParams });
    } catch (error) {
      console.error("Error during signature:", error);
      notification.error("Failed to sign message. Please try again.");
    }
  };

  return {
    handleRegister,
    isRegistering,
  };
}
