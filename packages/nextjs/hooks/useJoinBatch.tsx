import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSignTypedData } from "wagmi";
import { userJoinBatch } from "~~/services/api/users";
import { UserByAddress } from "~~/services/database/repositories/users";
import { EIP_712_TYPED_DATA__JOIN_BATCH } from "~~/services/eip712/join-batch";
import { notification } from "~~/utils/scaffold-eth";

export function useJoinBatch({ user }: { user?: UserByAddress }) {
  const queryClient = useQueryClient();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: joinBatch, isPending: isJoiningBatch } = useMutation({
    mutationFn: userJoinBatch,
    onSuccess: user => {
      queryClient.setQueryData(["user", user.userAddress], user);
      notification.success(<span>You&apos;ve successfully joined the batch</span>);
    },
    onError: (error: Error) => {
      console.error("Join Batch error:", error);
      notification.error(error.message || "Failed to join Batch. Please try again.");
    },
  });

  const handleJoinBatch = async () => {
    if (!user) return;

    try {
      const loadingNotificationId = notification.loading("Awaiting for Wallet signature...");
      const signature = await signTypedDataAsync(EIP_712_TYPED_DATA__JOIN_BATCH);
      notification.remove(loadingNotificationId);
      joinBatch({ address: user.userAddress, signature });
    } catch (error) {
      console.error("Error during signature:", error);
      notification.error("Failed to sign message. Please try again.");
    }
  };

  return {
    handleJoinBatch,
    isJoiningBatch,
  };
}
