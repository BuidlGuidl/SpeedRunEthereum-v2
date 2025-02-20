"use client";

import React from "react";
import Link from "next/link";
import PadLockIcon from "../_assets/icons/PadLockIcon";
import QuestionIcon from "../_assets/icons/QuestionIcon";
import { User } from "../_types/User";
import { useAccount, useWalletClient } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

type JoinBGProps = {
  isLocked: boolean;
  connectedBuilder: User;
  lockReasonToolTip: string;
};

// TODO: Basic implementation. Update when user schema is ready.
const JoinBGButton: React.FC<JoinBGProps> = ({ isLocked, connectedBuilder, lockReasonToolTip }) => {
  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  // const [isJoining, setIsJoining] = useState(false);
  // // Optimistic update.
  // const [joined, setJoined] = useState(false);

  const address = connectedBuilder?.id;

  const onJoin = async () => {
    // setIsJoining(true);

    if (!connectedBuilder.socialLinks || Object.keys(connectedBuilder?.socialLinks ?? {}).length === 0) {
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

  // const builderAlreadyJoined = !!connectedBuilder?.joinedBg;

  if (!walletClient || !connectedAddress) {
    // TODO: Add connect wallet functionality
    return (
      <button className="flex justify-center text-[#088484] bg-[#C8F5FF] items-center text-xl lg:text-lg px-4 py-1 border-2 border-[#088484] rounded-full opacity-70">
        <span>Connect Wallet</span>
      </button>
    );
  }

  if (!connectedBuilder) {
    return (
      <Link
        href="/apply"
        className="flex justify-center text-[#088484] bg-[#C8F5FF] items-center text-xl lg:text-lg px-4 py-1 border-2 border-[#088484] rounded-full"
      >
        <span>Apply to 🏰️ BuidlGuidl</span>
      </Link>
    );
  }

  return (
    <>
      <button
        disabled={isLocked}
        className="flex justify-center text-[#088484] bg-[#C8F5FF] items-center text-xl lg:text-lg px-4 py-1 border-2 border-[#088484] rounded-full disabled:opacity-70"
        onClick={onJoin}
      >
        {isLocked && <PadLockIcon className="w-6 h-6 mr-2" />}
        <span>Join the 🏰️ BuidlGuidl</span>
      </button>
      {isLocked && (
        <div className="tooltip relative cursor-pointer ml-2 text-[#088484]" data-tip={lockReasonToolTip}>
          <QuestionIcon className="h-8 w-8" />
        </div>
      )}
    </>
  );
};

export default JoinBGButton;
