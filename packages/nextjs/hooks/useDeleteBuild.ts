import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useSignTypedData } from "wagmi";
import { useAccount } from "wagmi";
import { deleteBuild as deleteBuildApi } from "~~/services/api/users/builds";
import { EIP_712_TYPED_DATA__DELETE_BUILD } from "~~/services/eip712/builds";
import { notification } from "~~/utils/scaffold-eth";

export function useDeleteBuild({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: deleteBuild, isPending } = useMutation({
    mutationFn: async ({ buildId }: { buildId: string }) => {
      if (!address) throw new Error("Wallet not connected");

      const message = {
        ...EIP_712_TYPED_DATA__DELETE_BUILD.message,
        id: buildId,
      };

      const signature = await signTypedDataAsync({
        ...EIP_712_TYPED_DATA__DELETE_BUILD,
        message,
      });

      return deleteBuildApi({ address, signature, buildId });
    },
    onSuccess: () => {
      notification.success("Build deleted successfully!");
      router.refresh();
      onSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });

  return { deleteBuild, isPending };
}
