import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { fetchUpdateBatch } from "~~/services/api/batches";
import { BatchInsert } from "~~/services/database/repositories/batches";
import { EIP_712_TYPED_DATA__UPDATE_BATCH } from "~~/services/eip712/batches";
import { notification } from "~~/utils/scaffold-eth";

export const useUpdateBatch = ({ onSuccess }: { onSuccess?: () => void }) => {
  const router = useRouter();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: updateBatchMutation, isPending } = useMutation({
    mutationFn: async ({
      batchId,
      ...batch
    }: { batchId: string } & Omit<BatchInsert, "startDate"> & { startDate: string }) => {
      if (!address) throw new Error("Wallet not connected");

      const loadingNotificationId = notification.loading("Awaiting for Wallet signature...");
      const message = {
        ...EIP_712_TYPED_DATA__UPDATE_BATCH.message,
        name: batch.name,
        startDate: batch.startDate,
        status: batch.status,
        contractAddress: batch.contractAddress || "",
        telegramLink: batch.telegramLink,
        bgSubdomain: batch.bgSubdomain,
        network: batch.network,
      };

      const signature = await signTypedDataAsync({
        ...EIP_712_TYPED_DATA__UPDATE_BATCH,
        message,
      });
      notification.remove(loadingNotificationId);

      return fetchUpdateBatch(batchId, {
        address,
        signature,
        name: batch.name,
        startDate: batch.startDate,
        status: batch.status,
        contractAddress: batch.contractAddress || "",
        telegramLink: batch.telegramLink,
        bgSubdomain: batch.bgSubdomain,
        network: batch.network,
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
    updateBatch: updateBatchMutation,
    isPending,
  };
};
