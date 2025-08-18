import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSignatureWithNotification } from "~~/hooks/useSignatureWithNotification";
import { userJoinBatch } from "~~/services/api/users";
import { UserByAddress } from "~~/services/database/repositories/users";
import { EIP_712_TYPED_DATA__JOIN_BATCH } from "~~/services/eip712/join-batch";
import { notification } from "~~/utils/scaffold-eth";

export function useJoinBatch({ user }: { user?: UserByAddress }) {
  const queryClient = useQueryClient();
  const { signWithNotification } = useSignatureWithNotification();

  const { mutateAsync: joinBatchMutation, isPending: isJoiningBatch } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not found");

      const signature = await signWithNotification(EIP_712_TYPED_DATA__JOIN_BATCH);

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
