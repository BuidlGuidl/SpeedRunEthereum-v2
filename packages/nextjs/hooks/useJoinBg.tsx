import React from "react";
import Link from "next/link";
import { useAccount, useWalletClient } from "wagmi";
import { UserByAddress } from "~~/services/database/repositories/users";
import { notification } from "~~/utils/scaffold-eth";
import { getUserSocialsList } from "~~/utils/socials";

// TODO: Update the logic
export const useJoinBg = ({ user }: { user: UserByAddress }) => {
  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  // const [isJoining, setIsJoining] = useState(false);
  // // Optimistic update.
  // const [joined, setJoined] = useState(false);

  const address = user?.userAddress;

  const onJoin = async () => {
    // setIsJoining(true);

    const socialsList = getUserSocialsList(user);
    if (socialsList.length === 0) {
      notification.error(
        <div className="flex flex-col gap-2">
          <span className="font-medium">Can&apos;t join the BuidlGuidl.</span>
          <span>
            In order to join the BuildGuidl you need to set your socials in{" "}
            <Link href="/portfolio" className="underline">
              your portfolio
            </Link>
            . It&apos;s our way to contact you.
          </span>
        </div>,
      );
      // setIsJoining(false);

      return;
    }

    let signMessage;
    try {
      const signMessageResponse = await fetch(`/sign-message?messageId=bgJoin&address=${address}`);
      if (!signMessageResponse.ok) {
        throw new Error("Failed to fetch sign message");
      }
      const data = await signMessageResponse.json();
      signMessage = data;
    } catch (error) {
      notification.error(
        <div className="flex flex-col gap-2">
          <span className="font-medium">Error Getting Signature</span>
          <span>Can&apos;t get the message to sign. Please try again</span>
        </div>,
      );
      return;
    }

    let signature;
    try {
      signature = await walletClient?.signMessage({ message: signMessage });
    } catch (error) {
      notification.error(
        <div className="flex flex-col gap-2">
          <span className="font-medium">Signature Cancelled</span>
          <span>The signature was cancelled</span>
        </div>,
      );
      console.error(error);
      return;
    }

    try {
      const response = await fetch("/bg/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          address: address,
        },
        body: JSON.stringify({ signature }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData);
      }
    } catch (error) {
      notification.error(
        <div className="flex flex-col gap-2">
          <span className="font-medium">Submission Failed</span>
          <span>Submission Error. Please try again.</span>
        </div>,
      );
      console.error(error);
      return;
    }

    notification.success(
      <div className="flex flex-col gap-2">
        <span className="font-medium">Welcome to BuidlGuidl!</span>
        <span>
          Visit{" "}
          <Link href="https://buidlguidl.com" className="underline" target="_blank">
            BuidlGuidl
          </Link>{" "}
          and start crafting your Web3 portfolio by submitting your DEX, Multisig or SVG NFT build.
        </span>
      </div>,
    );
    // setIsJoining(false);
    // setJoined(true);
  };

  // const builderAlreadyJoined = !!user?.joinedBg;

  return { onJoin, walletClient, connectedAddress };
};
