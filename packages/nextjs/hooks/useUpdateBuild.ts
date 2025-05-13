import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useSignTypedData } from "wagmi";
import { useAccount } from "wagmi";
import { BuildFormInputs } from "~~/app/builders/[address]/_components/builds/BuildFormModal";
import { updateBuild } from "~~/services/api/users/builds";
import { EIP_712_TYPED_DATA__UPDATE_BUILD } from "~~/services/eip712/builds";
import { notification } from "~~/utils/scaffold-eth";

export function useUpdateBuild({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: updateBuildMutation, isPending } = useMutation({
    mutationFn: async ({ build, buildId }: { build: BuildFormInputs; buildId: string }) => {
      if (!address) throw new Error("Wallet not connected");

      const buildWithDefaults = {
        ...build,
        desc: build.desc || "",
        buildType: build.buildType || "",
        buildCategory: build.buildCategory || "",
        demoUrl: build.demoUrl || "",
        videoUrl: build.videoUrl || "",
        imageUrl: build.imageUrl || "",
        githubUrl: build.githubUrl || "",
        coBuilders: build.coBuilders || [],
      };

      const message = {
        buildId,
        ...EIP_712_TYPED_DATA__UPDATE_BUILD.message,
        ...buildWithDefaults,
      };

      const signature = await signTypedDataAsync({
        ...EIP_712_TYPED_DATA__UPDATE_BUILD,
        message,
      });

      return updateBuild({ address, signature, build }, buildId);
    },
    onSuccess: () => {
      notification.success("Build updated successfully!");
      router.refresh();
      onSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });

  return { updateBuild: updateBuildMutation, isPending };
}
