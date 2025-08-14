import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { updateSocials } from "~~/services/api/users";
import { UserSocials } from "~~/services/database/repositories/users";
import { EIP_712_TYPED_DATA__UPDATE_SOCIALS } from "~~/services/eip712/socials";
import { notification } from "~~/utils/scaffold-eth";

export const useUpdateSocials = ({ onSuccess }: { onSuccess?: () => void }) => {
  const router = useRouter();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: updateSocialsMutation, isPending } = useMutation({
    mutationFn: async (socials: UserSocials) => {
      if (!address) throw new Error("Wallet not connected");

      const socialsWithDefaults = {
        socialTelegram: "",
        socialX: "",
        socialGithub: "",
        socialInstagram: "",
        socialDiscord: "",
        socialEmail: "",
        socialFarcaster: "",
        ...socials,
      };

      const loadingNotificationId = notification.loading("Awaiting for Wallet signature...");
      const message = {
        ...EIP_712_TYPED_DATA__UPDATE_SOCIALS.message,
        ...socialsWithDefaults,
      };

      const signature = await signTypedDataAsync({
        ...EIP_712_TYPED_DATA__UPDATE_SOCIALS,
        message,
      });
      notification.remove(loadingNotificationId);

      return updateSocials({
        userAddress: address,
        signature,
        socials,
      });
    },
    onSuccess: () => {
      notification.success("Socials updated successfully!");
      router.refresh();
      onSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });

  return {
    updateSocials: updateSocialsMutation,
    isPending,
  };
};
