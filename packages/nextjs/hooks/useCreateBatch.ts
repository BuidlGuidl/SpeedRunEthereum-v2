import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { fetchCreateBatch } from "~~/services/api/batches";
import { SUPPORTED_NETWORKS } from "~~/services/database/config/types";
import { BatchInsert } from "~~/services/database/repositories/batches";
import { EIP_712_TYPED_DATA__CREATE_BATCH } from "~~/services/eip712/batches";
import { notification } from "~~/utils/scaffold-eth";

export const useCreateBatch = ({ onSuccess }: { onSuccess?: () => void }) => {
  const router = useRouter();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: createBatchMutation, isPending } = useMutation({
    mutationFn: async (batch: Omit<BatchInsert, "id" | "startDate"> & { startDate: string }) => {
      if (!address) throw new Error("Wallet not connected");

      const updatedBatch = {
        ...batch,
        contractAddress: batch.contractAddress || "",
        network: batch.network || SUPPORTED_NETWORKS.NONE,
      };

      const message = {
        ...EIP_712_TYPED_DATA__CREATE_BATCH.message,
        ...updatedBatch,
      };

      const signature = await signTypedDataAsync({
        ...EIP_712_TYPED_DATA__CREATE_BATCH,
        message,
      });

      return fetchCreateBatch({ ...updatedBatch, address, signature });
    },
    onSuccess: () => {
      notification.success("Batch created successfully!");
      router.refresh();
      onSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });

  return {
    createBatch: createBatchMutation,
    isPending,
  };
};
