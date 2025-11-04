import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { UserIcon } from "@heroicons/react/24/outline";
import { PunkBlockie } from "~~/components/PunkBlockie";
import { Address } from "~~/components/scaffold-eth";
import { useUserRegister } from "~~/hooks/useUserRegister";

export const RegisterUser = () => {
  const { address } = useAccount();
  const [showTooltip, setShowTooltip] = useState(true);
  const { handleRegister, isRegistering } = useUserRegister();
  const containerRef = useRef<HTMLDivElement>(null);
  const [storedReferrer] = useLocalStorage<string | null>("originalReferrer", null);
  const [storedUtmParams] = useLocalStorage<string | null>("originalUtmParams", null);
  const parsedUtmParams = storedUtmParams ? JSON.parse(storedUtmParams) : undefined;

  useEffect(() => {
    if (!showTooltip) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip]);

  return (
    <div className="relative" ref={containerRef}>
      <span className="absolute top-[-5px] right-[-5px] bg-red-600 rounded-full w-2 h-2 "></span>
      <button className="flex items-center rounded-full bg-base-300" onClick={() => setShowTooltip(!showTooltip)}>
        {isRegistering ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <UserIcon className="w-6 h-6" />
        )}
      </button>

      {showTooltip && (
        <div
          data-testid="register-user-tooltip"
          className="absolute top-full left-[-250px] mt-2 p-8 w-64 md:w-[290px] bg-base-200 rounded-xl shadow-lg border border-base-300 z-10 flex flex-col items-center text-center"
        >
          <h3 className="text-lg font-bold mb-1">Register as a builder</h3>
          <p className="m-0 mb-4 text-sm font-light text-neutral">
            Sign a message with your wallet to create a builder profile.
          </p>
          {address && (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="rounded-md border-primary border">
                <PunkBlockie address={address} scale={0.5} className="rounded-md" />
              </div>
              <Address address={address} size="sm" hideAvatar />
            </div>
          )}
          <button
            className="flex items-center justify-center py-1.5 lg:py-2 px-3 lg:px-4 border-2 border-primary rounded-full bg-base-300 hover:bg-base-200 transition-colors cursor-pointer mt-4 text-sm w-full"
            onClick={() =>
              handleRegister({
                referrer: storedReferrer,
                originalUtmParams: parsedUtmParams,
                eventTrigger: "header_register_tooltip_button",
              })
            }
            disabled={isRegistering}
            data-testid="register-user-tooltip-button"
          >
            {isRegistering ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <span>✍️ Register</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterUser;
