import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useSignatureWithNotification } from "~~/hooks/useSignatureWithNotification";
import { EIP_712_TYPED_DATA__UPDATE_ONCHAIN_DATA } from "~~/services/eip712/onchain-data";
import { notification } from "~~/utils/scaffold-eth";

export function useUpdateOnchainData() {
  const { address } = useAccount();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signWithNotification } = useSignatureWithNotification();

  const { mutate: updateOnchainData, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const signature = await signWithNotification(EIP_712_TYPED_DATA__UPDATE_ONCHAIN_DATA);

      const response = await fetch(`/api/users/${address}/update-onchain-data`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, signature }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update onchain data");
      }

      const data = await response.json();
      return data.user;
    },
    onSuccess: user => {
      queryClient.setQueryData(["user", address], user);
      router.refresh();

      notification.success(`Onchain data updated successfully!`);
    },
    onError: (error: Error) => {
      console.error("Onchain data update error:", error);
      notification.error(error.message || "Failed to update profile data. Please try again.");
    },
  });

  const handleUpdateOnchainData = async () => {
    if (!address) return;

    try {
      updateOnchainData();
    } catch (error) {
      console.error("Error during onchain data update:", error);
      notification.error("Failed to update profile data. Please try again.");
    }
  };

  return {
    handleUpdateOnchainData,
    isUpdating,
  };
}
