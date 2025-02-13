import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { registerUser } from "~~/services/api/users";
import { EIP_712_TYPED_DATA__USER_REGISTER } from "~~/utils/eip712/register";
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

  const handleRegister = async () => {
    if (!address) return;

    try {
      const signature = await signTypedDataAsync(EIP_712_TYPED_DATA__USER_REGISTER);
      register({ address, signature });
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
