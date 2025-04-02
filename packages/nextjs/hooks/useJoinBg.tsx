import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSignTypedData } from "wagmi";
import { userJoinBg } from "~~/services/api/users";
import { UserByAddress } from "~~/services/database/repositories/users";
import { EIP_712_TYPED_DATA__JOIN_BG } from "~~/services/eip712/join-bg";
import { notification } from "~~/utils/scaffold-eth";
import { getUserSocialsList } from "~~/utils/socials";

export function useJoinBg({ user }: { user?: UserByAddress }) {
  const queryClient = useQueryClient();
  const { signTypedDataAsync } = useSignTypedData();

  const { mutate: joinBg, isPending: isJoiningBg } = useMutation({
    mutationFn: userJoinBg,
    onSuccess: user => {
      queryClient.setQueryData(["user", user.userAddress], user);
      notification.success(
        <div className="flex flex-col gap-2">
          <span className="font-medium">Welcome to BuidlGuidl!</span>
          <span>
            Visit{" "}
            <a href="https://buidlguidl.com" className="font-semibold link" target="_blank">
              BuidlGuidl.com
            </a>{" "}
            and start crafting your Web3 portfolio by submitting your DEX, Multisig or SVG NFT build.
          </span>
        </div>,
      );
    },
    onError: (error: Error) => {
      console.error("Join Build Guild error:", error);
      notification.error(error.message || "Failed to join Build Guild. Please try again.");
    },
  });

  const handleJoinBg = async () => {
    if (!user) return;

    const socialsList = getUserSocialsList(user);
    if (socialsList.length === 0) {
      notification.error(
        <div className="flex flex-col gap-2">
          <span className="font-medium">Can&apos;t join the BuidlGuidl.</span>
          <span>
            In order to join the BuildGuidl you need to set your socials in{" "}
            <Link href={`/builders/${user.userAddress}`} className="link">
              your portfolio
            </Link>
            . It&apos;s our way to contact you.
          </span>
        </div>,
      );
      return;
    }

    try {
      const signature = await signTypedDataAsync(EIP_712_TYPED_DATA__JOIN_BG);
      joinBg({ address: user.userAddress, signature });
    } catch (error) {
      console.error("Error during signature:", error);
      notification.error("Failed to sign message. Please try again.");
    }
  };

  return {
    handleJoinBg,
    isJoiningBg,
  };
}
