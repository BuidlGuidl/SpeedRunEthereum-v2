import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { EIP_712_TYPED_DATA__UPDATE_ENS } from "~~/services/eip712/ens";
import { notification } from "~~/utils/scaffold-eth";

export function useUpdateEns() {
  const { address } = useAccount();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: updateEns, isPending: isUpdatingEns } = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const signature = await signTypedDataAsync(EIP_712_TYPED_DATA__UPDATE_ENS);

      const response = await fetch(`/api/users/${address}/update-ens`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, signature }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update ENS");
      }

      const data = await response.json();
      return data.user;
    },
    onSuccess: user => {
      queryClient.setQueryData(["user", address], user);
      router.refresh();
      notification.success("ENS updated successfully!");
    },
    onError: (error: Error) => {
      console.error("ENS update error:", error);
      notification.error(error.message || "Failed to update ENS. Please try again.");
    },
  });

  const handleUpdateEns = async () => {
    if (!address) return;

    try {
      updateEns();
    } catch (error) {
      console.error("Error during ENS update:", error);
      notification.error("Failed to update ENS. Please try again.");
    }
  };

  return {
    handleUpdateEns,
    isUpdatingEns,
  };
}
