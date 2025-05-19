import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useSignTypedData } from "wagmi";
import { likeBuild } from "~~/services/api/users/builds";
import { EIP_712_TYPED_DATA__LIKE_BUILD } from "~~/services/eip712/builds";
import { notification } from "~~/utils/scaffold-eth";

export function useBuildLike({ onSuccess }: { onSuccess?: () => void }) {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const router = useRouter();

  const { mutate: likeBuildMutation, isPending } = useMutation({
    mutationFn: async ({ buildId, action }: { buildId: string; action: "like" | "unlike" }) => {
      if (!address) throw new Error("Wallet not connected");

      const message = {
        buildId,
        action,
      };

      const signature = await signTypedDataAsync({
        ...EIP_712_TYPED_DATA__LIKE_BUILD,
        message,
      });

      return likeBuild({ address, signature, buildId });
    },
    onSuccess: () => {
      onSuccess?.();
      router?.refresh();
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });

  return { likeBuildMutation, isPending };
}
