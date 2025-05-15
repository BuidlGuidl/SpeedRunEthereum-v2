import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { BatchUserStatus, UserRole } from "~~/services/database/config/types";
import { EIP_712_TYPED_DATA__UPDATE_USER } from "~~/services/eip712/users";
import { notification } from "~~/utils/scaffold-eth";

export const useUpdateUser = ({ onSuccess }: { onSuccess?: () => void }) => {
  const router = useRouter();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: updateUserMutation, isPending } = useMutation({
    mutationFn: async ({
      userAddress,
      role,
      batchId,
      batchStatus,
    }: {
      userAddress: string;
      role: UserRole | null;
      batchId: number | null;
      batchStatus: BatchUserStatus | null;
    }) => {
      if (!address) throw new Error("Wallet not connected");

      const message = {
        ...EIP_712_TYPED_DATA__UPDATE_USER.message,
        userAddress,
        role: role || "",
        batchId: batchId?.toString() || "",
        batchStatus: batchStatus || "",
      };

      const signature = await signTypedDataAsync({
        ...EIP_712_TYPED_DATA__UPDATE_USER,
        message,
      });

      const response = await fetch(`/api/users/${userAddress}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          signature,
          role,
          batchId,
          batchStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }

      return response.json();
    },
    onSuccess: () => {
      notification.success("User updated successfully!");
      router.refresh();
      onSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });

  return {
    updateUser: updateUserMutation,
    isPending,
  };
};
