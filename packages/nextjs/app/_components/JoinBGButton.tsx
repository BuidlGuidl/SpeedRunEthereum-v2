"use client";

import React from "react";
import Link from "next/link";
import PadLockIcon from "../_assets/icons/PadLockIcon";
import { User } from "../_types/User";
import { useAccount, useWalletClient } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

type JoinBGProps = {
  text: string;
  isLocked: boolean;
  connectedBuilder: User;
};

// TODO: Basic implementation. Update when user schema is ready.
const JoinBGButton: React.FC<JoinBGProps> = ({ text, isLocked, connectedBuilder }) => {
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
    return (
      <button
        disabled
        className="flex items-center px-6 py-5 text-lg font-medium border-2 border-gray-300 
          bg-gray-100 rounded-lg opacity-70 cursor-not-allowed"
      >
        <span className="text-gray-600">Connect Wallet</span>
      </button>
    );
  }

  if (!connectedBuilder) {
    return (
      <Link
        href="/apply"
        className="flex items-center px-6 py-5 text-lg font-medium border-2 
          border-primary hover:border-primary-dark bg-white rounded-lg 
          transition-colors duration-200"
      >
        <span className="text-primary hover:text-primary-dark">Apply to BuidlGuidl</span>
      </Link>
    );
  }

  return (
    <button
      disabled={isLocked}
      className="flex justify-center items-center text-xl lg:text-lg px-2 py-1 border-2 border-primary rounded-full disabled:opacity-70"
      onClick={onJoin}
    >
      {isLocked && <PadLockIcon className="w-6 h-6 mr-2" />}
      <span>{text}</span>
    </button>
  );
};

export default JoinBGButton;
