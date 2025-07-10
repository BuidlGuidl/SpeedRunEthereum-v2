import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { submitChallenge } from "~~/services/api/challenges";
import { EIP_712_TYPED_DATA__CHALLENGE_SUBMIT } from "~~/services/eip712/challenge";
import { notification } from "~~/utils/scaffold-eth";

type SubmitChallengeParams = {
  challengeId: string;
  frontendUrl: string;
  contractUrl: string;
};

const validateUrls = (params: SubmitChallengeParams) => {
  try {
    new URL(params.frontendUrl);
    new URL(params.contractUrl);
  } catch (e) {
    throw new Error("Please enter valid URLs");
  }
};

export const useSubmitChallenge = ({ onSuccess }: { onSuccess?: () => void }) => {
  const router = useRouter();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: submitChallengeMutation, isPending } = useMutation({
    mutationFn: async (submitChallengeParams: SubmitChallengeParams) => {
      if (!address) throw new Error("Wallet not connected");

      validateUrls(submitChallengeParams);

      const message = {
        ...EIP_712_TYPED_DATA__CHALLENGE_SUBMIT.message,
        ...submitChallengeParams,
      };

      const signature = await signTypedDataAsync({
        ...EIP_712_TYPED_DATA__CHALLENGE_SUBMIT,
        message,
      });

      return submitChallenge({
        userAddress: address,
        signature,
        ...submitChallengeParams,
      });
    },
    onSuccess: () => {
      notification.success("Challenge submitted successfully!");
      router.push(`/builders/${address}`);
      router.refresh();
      onSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message);
    },
  });

  return {
    submitChallenge: submitChallengeMutation,
    isPending,
  };
};
