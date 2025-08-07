import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { submitChallenge } from "~~/services/api/challenges";
import { EIP_712_TYPED_DATA__CHALLENGE_SUBMIT } from "~~/services/eip712/challenge";
import { notification } from "~~/utils/scaffold-eth";

const VALID_BLOCK_EXPLORER_HOSTS = [
  "sepolia.etherscan.io",
  "sepolia-optimism.etherscan.io",
  "sepolia.arbiscan.io",
  "cardona-zkevm.polygonscan.com",
  "amoy.polygonscan.com",
  "sepolia.basescan.org",
  "sepolia.scrollscan.com",
  "alfajores.celoscan.io",
];

type SubmitChallengeParams = {
  challengeId: string;
  frontendUrl: string;
  contractUrl: string;
};

const validateUrls = (params: SubmitChallengeParams) => {
  try {
    new URL(params.frontendUrl);
  } catch (e) {
    throw new Error("Please enter a valid URL of deployed app");
  }

  try {
    const etherscanUrl = new URL(params.contractUrl);
    if (!VALID_BLOCK_EXPLORER_HOSTS.includes(etherscanUrl.host)) {
      throw new Error();
    }
  } catch (e) {
    throw new Error(
      `Please use a valid contract URL.\n\nSupported block explorers: \n${VALID_BLOCK_EXPLORER_HOSTS.join("\n")}`,
    );
  }

  return true;
};

export const useSubmitChallenge = ({ onSuccess }: { onSuccess?: () => void }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      // Invalidate user challenges query to trigger auto-refresh
      queryClient.invalidateQueries({
        queryKey: ["userChallenges", address],
      });
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
