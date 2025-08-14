import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSignTypedData } from "wagmi";
import { userJoinBatch } from "~~/services/api/users";
import { UserByAddress } from "~~/services/database/repositories/users";
import { EIP_712_TYPED_DATA__JOIN_BATCH } from "~~/services/eip712/join-batch";
import { notification } from "~~/utils/scaffold-eth";

export function useJoinBatch({ user }: { user?: UserByAddress }) {
  const queryClient = useQueryClient();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutateAsync: joinBatchMutation, isPending: isJoiningBatch } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not found");

      let signature: `0x${string}` | undefined;
      const loadingNotificationId = notification.loading("Awaiting for Wallet signature...");
      try {
        signature = await signTypedDataAsync(EIP_712_TYPED_DATA__JOIN_BATCH);
      } finally {
        notification.remove(loadingNotificationId);
      }

      return userJoinBatch({ address: user.userAddress, signature });
    },
    onSuccess: user => {
      queryClient.setQueryData(["user", user.userAddress], user);
      notification.success(<span>You&apos;ve successfully joined the batch</span>);
    },
    onError: (error: Error) => {
      console.error("Join Batch error:", error);
      notification.error(error.message || "Failed to join Batch. Please try again.");
    },
  });

  return {
    handleJoinBatch: joinBatchMutation,
    isJoiningBatch,
  };
}
