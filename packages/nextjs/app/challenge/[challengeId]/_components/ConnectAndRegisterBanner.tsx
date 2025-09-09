"use client";

import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { useUser } from "~~/hooks/useUser";
import { useUserRegister } from "~~/hooks/useUserRegister";

export const ConnectAndRegisterBanner = () => {
  const { address: connectedAddress } = useAccount();
  const { data: user, isLoading: isLoadingUser } = useUser(connectedAddress);
  const { handleRegister, isRegistering } = useUserRegister();
  const [storedReferrer] = useLocalStorage<string | null>("originalReferrer", null);
  const [storedUtmParams] = useLocalStorage<string | null>("originalUtmParams", null);
  const parsedUtmParams = storedUtmParams ? JSON.parse(storedUtmParams) : undefined;

  if (user || isLoadingUser) {
    return null;
  }

  const isWalletConnected = !!connectedAddress;

  return (
    <div className="fixed bottom-8 inset-x-0 mx-auto w-fit max-w-[100%] p-2">
      <div className="bg-base-100 border border-primary/30 rounded-lg p-4 shadow-lg">
        <div className="text-center space-y-3">
          <div className="text-sm font-semibold text-primary">🚀 Ready to submit your challenge?</div>

          <div className="text-xs md:text-sm text-base-content/80">
            {!isWalletConnected ? (
              <>
                <p>
                  You&apos;re viewing this challenge as a <span className="font-bold">guest</span>. Want to start
                  building your portfolio?
                </p>
                <p>
                  <span className="font-bold">Connect your wallet and register</span> to unlock the full
                  SpeedRunEthereum experience.
                </p>
              </>
            ) : (
              <>
                <p>
                  <span className="font-bold">Register</span> to submit challenges, track your progress and start
                  building your portfolio.
                </p>
              </>
            )}
          </div>

          <div className="flex justify-center">
            {!isWalletConnected ? (
              <RainbowKitCustomConnectButton />
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  handleRegister({
                    referrer: storedReferrer,
                    originalUtmParams: parsedUtmParams,
                  })
                }
                disabled={isRegistering}
              >
                {isRegistering ? <span className="loading loading-spinner loading-xs"></span> : <>✍️ Register</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
