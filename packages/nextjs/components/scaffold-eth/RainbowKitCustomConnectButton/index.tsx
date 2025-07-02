"use client";

// @refresh reset
import { useEffect } from "react";
import Link from "next/link";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { signOut } from "next-auth/react";
import { Address } from "viem";
import { useAccount, useDisconnect } from "wagmi";
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import RegisterUser from "~~/app/_components/RegisterUser";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useAuthSession } from "~~/hooks/useAuthSession";
import { useUser } from "~~/hooks/useUser";
import { UserRole } from "~~/services/database/config/types";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const { targetNetwork } = useTargetNetwork();
  const { address: connectedAddress } = useAccount();
  const { data: user, isLoading: isLoadingUser } = useUser(connectedAddress);
  const { disconnect } = useDisconnect();
  const { userAddress: sessionUserAddress } = useAuthSession();
  const isAdmin = user?.role === UserRole.ADMIN;
  const { isAdmin: isAdminFromSession } = useAuthSession();

  useEffect(() => {
    if (sessionUserAddress && connectedAddress && connectedAddress !== sessionUserAddress) {
      disconnect();
      signOut({ redirect: true, callbackUrl: "/" });
    }
  }, [connectedAddress, sessionUserAddress, disconnect]);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        if (!connected) {
          return (
            <button
              className="flex items-center py-1.5 lg:py-2 px-3 lg:px-4 border-2 border-primary rounded-full bg-base-300 hover:bg-base-200 transition-colors cursor-pointer"
              onClick={openConnectModal}
              type="button"
            >
              Connect <span className="hidden md:inline-block md:ml-1">Wallet</span>
            </button>
          );
        }

        if (chain.unsupported || chain.id !== targetNetwork.id) {
          return <WrongNetworkDropdown />;
        }

        if (isLoadingUser) {
          return <span className="loading loading-spinner loading-sm"></span>;
        }

        if (!user) {
          return (
            <div className="flex items-baseline gap-4">
              <RegisterUser />
              <button className="flex items-center rounded-full bg-base-300" onClick={() => disconnect()}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          );
        }

        return (
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            {isAdmin && (
              <div className="flex items-center gap-2">
                {isAdminFromSession ? (
                  <span className="rounded-full pl-2 pr-3 flex items-center gap-1 py-0.5 font-semibold bg-red-100 text-red-800">
                    <EyeIcon className="w-4 h-4" /> ADMIN
                  </span>
                ) : (
                  <Link href="/admin/siwe">
                    <span className="rounded-full pl-2 pr-3 flex items-center gap-1 py-0.5 font-semibold bg-red-100 text-red-800 hover:bg-red-200">
                      <EyeSlashIcon className="w-4 h-4" /> ADMIN
                    </span>
                  </Link>
                )}
              </div>
            )}
            <AddressInfoDropdown
              address={account.address as Address}
              displayName={user.ens || account.address}
              ensAvatar={user.ensAvatar}
              blockExplorerAddressLink={blockExplorerAddressLink}
              isAdmin={isAdmin}
            />
            <AddressQRCodeModal
              address={account.address as Address}
              modalId="qrcode-modal"
              cachedEns={user.ens}
              cachedEnsAvatar={user.ensAvatar}
            />
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
