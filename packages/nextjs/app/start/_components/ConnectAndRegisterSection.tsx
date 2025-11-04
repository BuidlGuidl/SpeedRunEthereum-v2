"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { useUser } from "~~/hooks/useUser";
import { useUserRegister } from "~~/hooks/useUserRegister";

export const ConnectAndRegisterSection = () => {
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
      await handleRegister({
        referrer: storedReferrer,
        originalUtmParams: parsedUtmParams,
        eventTrigger: "start_register_button",
      });
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLocalLoading(false);
      router.push(`/builders/${connectedAddress}`);
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
              className="w-[300px] h-[60px] text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain flex items-center justify-center hover:opacity-75"
              type="button"
            >
              Go to your Portfolio
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingUser) {
    return (
      <div className="flex justify-center">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  return (
    <div className="text-center">
      {!isWalletConnected ? (
        <>
          <h3 className="mb-2 text-center font-medium text-xl">Start learning today!</h3>
          <p className="mt-2 text-center">
            Connect your wallet and register to start building your Ethereum developer portfolio.
          </p>
          <div className="flex justify-center">
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
          </div>
        </>
      ) : (
        <>
          <h3 className="mb-2 text-center font-medium text-xl">Almost there!</h3>
          <p className="mt-2 text-center">
            Register as a builder to start your journey. In the first challenge, you&apos;ll deploy your first smart
            contract and mint an NFT on a testnet.
          </p>
          <div className="flex justify-center">
            <button
              className="w-[300px] h-[60px] text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain flex items-center justify-center hover:opacity-75"
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
