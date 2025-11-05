"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { useUser } from "~~/hooks/useUser";
import { useUserRegister } from "~~/hooks/useUserRegister";

export const DynamicCtaButton = () => {
  const { address: connectedAddress } = useAccount();
  const { data: user, isLoading: isLoadingUser } = useUser(connectedAddress);
  const { handleRegister, isRegistering } = useUserRegister();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [storedReferrer] = useLocalStorage<string | null>("originalReferrer", null);
  const [storedUtmParams] = useLocalStorage<string | null>("originalUtmParams", null);
  const parsedUtmParams = storedUtmParams ? JSON.parse(storedUtmParams) : undefined;
  const router = useRouter();

  const isWalletConnected = !!connectedAddress;
  const isLoading = isLocalLoading || isRegistering;

  const handleRegisterClick = async () => {
    setIsLocalLoading(true);
    try {
      await handleRegister({ referrer: storedReferrer, originalUtmParams: parsedUtmParams });
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLocalLoading(false);
      router.push(`/builders/${connectedAddress}`);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex justify-center">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  // If user is registered, show "go to your portfolio" button
  if (user && !isLoadingUser) {
    return (
      <div className="flex justify-center">
        <Link href={`/builders/${connectedAddress}`}>
          <button
            className="w-[300px] h-[60px] text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain flex items-center justify-center hover:opacity-75"
            type="button"
          >
            Go to your Portfolio
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      {!isWalletConnected ? (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              className="w-[300px] h-[60px] text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain flex items-center justify-center hover:opacity-75"
              onClick={openConnectModal}
              type="button"
            >
              Connect Wallet
            </button>
          )}
        </ConnectButton.Custom>
      ) : (
        <button
          className="w-[300px] h-[60px] text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain flex items-center justify-center hover:opacity-75"
          onClick={handleRegisterClick}
          disabled={isLoading}
        >
          {isLoading ? <span className="loading loading-spinner loading-md"></span> : <>✍️ Register as Builder</>}
        </button>
      )}
    </div>
  );
};
