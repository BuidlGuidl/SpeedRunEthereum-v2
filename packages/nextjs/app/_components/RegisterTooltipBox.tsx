import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { UserIcon } from "@heroicons/react/24/outline";
import { PunkBlockie } from "~~/components/PunkBlockie";
import { Address } from "~~/components/scaffold-eth";
import { useUserRegister } from "~~/hooks/useUserRegister";

export const RegisterTooltipBox = () => {
  const { address } = useAccount();
  const [showTooltip, setShowTooltip] = useState(false);
  const { handleRegister, isRegistering } = useUserRegister();
  const containerRef = useRef<HTMLDivElement>(null);

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
        <div className="absolute top-full left-[-250px] mt-2 p-8 w-64 bg-base-200 rounded-xl shadow-lg border border-base-300 z-10 flex flex-col items-center text-center">
          <h3 className="text-base font-medium mb-1">Register as a builder</h3>
          <p className="m-0 mb-4 text-xs font-light">Sign a message with your wallet to create a builder profile.</p>
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
            onClick={handleRegister}
            disabled={isRegistering}
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

export default RegisterTooltipBox;
