"use client";

import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { useUser } from "~~/hooks/useUser";
import { useUserRegister } from "~~/hooks/useUserRegister";

export const WelcomeBanner = () => {
  const { address: connectedAddress } = useAccount();
  const { data: user, isLoading: isLoadingUser } = useUser(connectedAddress);
  const { handleRegister, isRegistering } = useUserRegister();

  if (user || isLoadingUser) {
    return null;
  }

  const isWalletConnected = !!connectedAddress;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 md:mb-16 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl">
      <div className="text-center space-y-4">
        <h2 className="text-lg md:text-2xl font-bold text-primary">🚀 Welcome to SpeedRunEthereum! 🏃‍♀️</h2>

        <p className="text-sm md:text-lg text-base-content/80">
          You&apos;re viewing this challenge as a <span className="font-bold">guest</span>. Want to start building your
          portfolio?
        </p>

        <div className="bg-base-100/50 rounded-lg p-4 space-y-3 hidden md:block">
          <p className="text-sm font-bold">Register to unlock the full SpeedRunEthereum experience:</p>
          <ul className="text-sm text-left space-y-1 text-base-content/70">
            <li>✅ Track your progress</li>
            <li>✅ Submit challenges that get autograded by our system</li>
            <li>✅ Build your onchain developer portfolio: challenges, builds, sidesquests and more</li>
            <li>✅ Join our Batch program and connect with other developers</li>
            <li>✅ Get recognized for your achievements</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {!isWalletConnected ? (
            <RainbowKitCustomConnectButton />
          ) : (
            <button className="btn btn-primary md:btn-lg" onClick={() => handleRegister(null)} disabled={isRegistering}>
              {isRegistering ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>✍️ Register as Builder</>
              )}
            </button>
          )}
        </div>

        <p className="text-xs text-base-content/60">
          Registration is free and only requires signing an offchain message with your wallet
        </p>
      </div>
    </div>
  );
};
