import React, { useState } from "react";
import Link from "next/link";
import { User } from "../_types/User";
import { useAccount, useWalletClient } from "wagmi";
import { SERVER_URL as serverUrl } from "~~/constants";
import { notification } from "~~/utils/scaffold-eth";

const serverPath = "/bg/join";

interface JoinBGProps {
  text: string;
  isChallengeLocked: boolean;
  connectedBuilder: User;
}

const JoinBGButton: React.FC<JoinBGProps> = ({ text, isChallengeLocked, connectedBuilder }) => {
  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isJoining, setIsJoining] = useState(false);
  // Optimistic update.
  const [joined, setJoined] = useState(false);

  const address = connectedBuilder?.id;

  const onJoin = async () => {
    setIsJoining(true);

    if (!connectedBuilder.socialLinks || Object.keys(connectedBuilder?.socialLinks ?? {}).length === 0) {
      notification.error("Can't join the BuidlGuidl", {
        // description: (
        //   <>
        //     In order to join the BuildGuidl you need to set your socials in{" "}
        //     <Link href="/portfolio" className="underline">
        //       your portfolio
        //     </Link>
        //     . It&apos;s our way to contact you.
        //   </>
        // ),
      });
      setIsJoining(false);
      return;
    }

    let signMessage;
    try {
      const signMessageResponse = await fetch(`${serverUrl}/sign-message?messageId=bgJoin&address=${address}`);
      if (!signMessageResponse.ok) {
        throw new Error("Failed to fetch sign message");
      }
      const data = await signMessageResponse.json();
      signMessage = data;
    } catch (error) {
      notification.error("Can't get the message to sign. Please try again");
      setIsJoining(false);
      return;
    }

    let signature;
    try {
      signature = await walletClient?.signMessage({ message: signMessage });
    } catch (error) {
      notification.error("The signature was cancelled");
      console.error(error);
      setIsJoining(false);
      return;
    }

    try {
      const response = await fetch(serverUrl + serverPath, {
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
      notification.error("Submission Error. Please try again.");
      console.error(error);
      setIsJoining(false);
      return;
    }

    notification.success("Welcome to the BuildGuidl :)", {
      // description: (
      //   <>
      //     Visit{" "}
      //     <Link href="https://buidlguidl.com" className="underline" target="_blank">
      //       BuidlGuidl
      //     </Link>{" "}
      //     and start crafting your Web3 portfolio by submitting your DEX, Multisig or SVG NFT build.
      //   </>
      // ),
    });
    setIsJoining(false);
    setJoined(true);
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
      disabled={isChallengeLocked}
      className={`flex items-center px-6 py-5 text-lg font-medium border-2 rounded-lg
        transition-colors duration-200 ${
          isChallengeLocked
            ? "border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
            : "border-primary hover:border-primary-dark bg-white text-primary hover:text-primary-dark"
        }`}
      onClick={onJoin}
    >
      <span>{text}</span>
    </button>
  );
};

export default JoinBGButton;
