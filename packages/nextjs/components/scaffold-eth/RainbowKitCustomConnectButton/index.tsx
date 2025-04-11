"use client";

// @refresh reset
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { useAccount, useDisconnect } from "wagmi";
import { XMarkIcon } from "@heroicons/react/24/outline";
import RegisterUser from "~~/app/_components/RegisterUser";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useUser } from "~~/hooks/useUser";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const { targetNetwork } = useTargetNetwork();
  const { address: connectedAddress } = useAccount();
  const { data: user, isLoading: isLoadingUser } = useUser(connectedAddress);
  const { disconnect } = useDisconnect();

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
          <>
            <AddressInfoDropdown
              address={account.address as Address}
              displayName={account.displayName}
              ensAvatar={account.ensAvatar}
              blockExplorerAddressLink={blockExplorerAddressLink}
            />
            <AddressQRCodeModal address={account.address as Address} modalId="qrcode-modal" />
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
