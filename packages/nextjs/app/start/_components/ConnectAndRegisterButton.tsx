"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useUser } from "~~/hooks/useUser";
import { useUserRegister } from "~~/hooks/useUserRegister";

export const ConnectAndRegisterButton = () => {
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

  // If user is registered, show "go to your portfolio" button
  if (user && !isLoadingUser) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Link href={`/builders/${connectedAddress}`}>
          <button
            className="w-[300px] h-[60px] text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain flex items-center justify-center"
            type="button"
          >
            Go to your portfolio
          </button>
        </Link>
      </div>
    );
  }

  // If still loading user data, show nothing
  if (isLoadingUser) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
      {!isWalletConnected ? (
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
      ) : (
        <button
          className="w-[300px] h-[60px] text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain flex items-center justify-center"
          onClick={handleRegisterClick}
          disabled={isLoading}
        >
          {isLoading ? <span className="loading loading-spinner loading-md"></span> : <>✍️ Register as Builder</>}
        </button>
      )}
    </div>
  );
};
