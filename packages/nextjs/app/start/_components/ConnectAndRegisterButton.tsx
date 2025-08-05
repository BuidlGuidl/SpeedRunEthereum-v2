"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useUser } from "~~/hooks/useUser";
import { useUserRegister } from "~~/hooks/useUserRegister";

export const ConnectAndRegisterButton = () => {
  const { address: connectedAddress } = useAccount();
  const { data: user, isLoading: isLoadingUser } = useUser(connectedAddress);
  const { handleRegister, isRegistering } = useUserRegister();

  if (user || isLoadingUser) {
    return null;
  }

  const isWalletConnected = !!connectedAddress;

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
      {!isWalletConnected ? (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              className="px-12 py-4 text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain"
              onClick={openConnectModal}
              type="button"
            >
              Connect Wallet
            </button>
          )}
        </ConnectButton.Custom>
      ) : (
        <button
          className="px-12 py-4 text-gray-600 bg-[url('/assets/start/button-frame.svg')] bg-no-repeat bg-center bg-contain"
          onClick={() => handleRegister(null)}
          disabled={isRegistering}
        >
          {isRegistering ? <span className="loading loading-spinner loading-sm"></span> : <>✍️ Register as Builder</>}
        </button>
      )}
    </div>
  );
};
