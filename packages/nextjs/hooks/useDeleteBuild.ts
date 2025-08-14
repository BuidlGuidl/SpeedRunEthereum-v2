import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useSignTypedData } from "wagmi";
import { useAccount } from "wagmi";
import { deleteBuild as deleteBuildApi } from "~~/services/api/users/builds";
import { EIP_712_TYPED_DATA__DELETE_BUILD } from "~~/services/eip712/builds";
import { notification } from "~~/utils/scaffold-eth";

export function useDeleteBuild() {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: deleteBuild, isPending } = useMutation({
    mutationFn: async ({ buildId, ownerAddress }: { buildId: string; ownerAddress: string }) => {
      if (!connectedAddress) throw new Error("Wallet not connected");

      const message = {
        ...EIP_712_TYPED_DATA__DELETE_BUILD.message,
        id: buildId,
      };

      let signature: `0x${string}` | undefined;
      const loadingNotificationId = notification.loading("Awaiting for Wallet signature...");
      try {
        signature = await signTypedDataAsync({
          ...EIP_712_TYPED_DATA__DELETE_BUILD,
          message,
        });
      } finally {
        notification.remove(loadingNotificationId);
      }

      return deleteBuildApi({ signatureAddress: connectedAddress, signature, buildId, userAddress: ownerAddress });
    },
    onSuccess: () => {
      notification.success("Build deleted successfully!");
      router.refresh();
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });

  return { deleteBuild, isPending };
}
