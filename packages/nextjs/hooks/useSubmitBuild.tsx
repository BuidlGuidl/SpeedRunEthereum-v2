import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { BuildFormInputs } from "~~/app/builders/[address]/_components/builds/BuildFormModal";
import { useSignatureWithNotification } from "~~/hooks/useSignatureWithNotification";
import { submitBuild } from "~~/services/api/users/builds";
import { EIP_712_TYPED_DATA__SUBMIT_BUILD } from "~~/services/eip712/builds";
import { notification } from "~~/utils/scaffold-eth";

export function useSubmitBuild({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const { address } = useAccount();
  const { signWithNotification } = useSignatureWithNotification();

  const { mutateAsync: submitBuildMutation, isPending } = useMutation({
    mutationFn: async (build: BuildFormInputs) => {
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
        ...EIP_712_TYPED_DATA__SUBMIT_BUILD.message,
        ...buildWithDefaults,
      };

      const signature = await signWithNotification({
        ...EIP_712_TYPED_DATA__SUBMIT_BUILD,
        message,
      });

      return submitBuild({ address, signature, ...build });
    },
    onSuccess: () => {
      notification.success("Build submitted successfully!");
      router.refresh();
      onSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });

  return { submitBuild: submitBuildMutation, isPending };
}
