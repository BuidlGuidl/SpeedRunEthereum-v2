import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { editBatch } from "~~/services/api/batches";
import { BatchInsert } from "~~/services/database/repositories/batches";
import { EIP_712_TYPED_DATA__EDIT_BATCH } from "~~/services/eip712/batches";
import { notification } from "~~/utils/scaffold-eth";

export const useEditBatch = ({ onSuccess }: { onSuccess?: () => void }) => {
  const router = useRouter();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: editBatchMutation, isPending } = useMutation({
    mutationFn: async ({
      batchId,
      ...batch
    }: { batchId: string } & Omit<BatchInsert, "startDate"> & { startDate: string }) => {
      if (!address) throw new Error("Wallet not connected");

      const message = {
        ...EIP_712_TYPED_DATA__EDIT_BATCH.message,
        batchId,
        name: batch.name,
        startDate: batch.startDate,
        status: batch.status,
        contractAddress: batch.contractAddress || "",
        telegramLink: batch.telegramLink,
      };

      const signature = await signTypedDataAsync({
        ...EIP_712_TYPED_DATA__EDIT_BATCH,
        message,
      });

      return editBatch(batchId, {
        address,
        signature,
        name: batch.name,
        startDate: batch.startDate,
        status: batch.status,
        contractAddress: batch.contractAddress || "",
        telegramLink: batch.telegramLink,
      });
    },
    onSuccess: () => {
      notification.success("Batch updated successfully!");
      router.refresh();
      onSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });

  return {
    editBatch: editBatchMutation,
    isPending,
  };
};
