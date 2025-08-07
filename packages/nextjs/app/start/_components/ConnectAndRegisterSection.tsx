"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useUser } from "~~/hooks/useUser";
import { useUserRegister } from "~~/hooks/useUserRegister";

export const ConnectAndRegisterSection = () => {
  const { address: connectedAddress } = useAccount();
  const { data: user, isLoading: isLoadingUser } = useUser(connectedAddress);
  const { handleRegister, isRegistering } = useUserRegister();
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const isWalletConnected = !!connectedAddress;
  const isLoading = isLocalLoading || isRegistering;

  const handleRegisterClick = async () => {
    setIsLocalLoading(true);
    try {
      await handleRegister(null);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLocalLoading(false);
    }
  };

  // If user is registered, show "go to your portfolio" section
  if (user && !isLoadingUser) {
    return (
      <div className="text-center">
        <h3 className="mb-2 text-center font-medium text-xl">Welcome back!</h3>
        <p className="mt-2 text-center">Continue your journey and explore your completed challenges.</p>
        <div className="flex justify-center">
          <Link href={`/builders/${connectedAddress}`}>
            <button
              className="w-[300px] h-[60px] text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain flex items-center justify-center"
              type="button"
            >
              Go to your portfolio
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // If still loading user data, show nothing
  if (isLoadingUser) {
    return null;
  }

  return (
    <div className="text-center">
      <h3 className="mb-2 text-center font-medium text-xl">Start learning today!</h3>
      {!isWalletConnected ? (
        <>
          <p className="mt-2 text-center">
            Connect your wallet and register to start your journey. In the first challenge, you&apos;ll deploy your
            first smart contract and mint an NFT on a testnet.
          </p>
          <div className="flex justify-center">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  className="w-[300px] h-[60px] text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain flex items-center justify-center"
                  onClick={openConnectModal}
                  type="button"
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
          <p className="mt-4 text-center text-sm">
            Registration is free and only requires signing an offchain message in your wallet.
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-center">
            You&apos;re almost there! Register as a builder to start your journey. In the first challenge, you&apos;ll
            deploy your first smart contract and mint an NFT on a testnet.
          </p>
          <div className="flex justify-center">
            <button
              className="w-[300px] h-[60px] text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain flex items-center justify-center"
              onClick={handleRegisterClick}
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner loading-md"></span> : <>✍️ Register as Builder</>}
            </button>
          </div>
          <p className="mt-4 text-center text-sm">
            Registration is free and only requires signing an offchain message in your wallet.
          </p>
        </>
      )}
    </div>
  );
};
