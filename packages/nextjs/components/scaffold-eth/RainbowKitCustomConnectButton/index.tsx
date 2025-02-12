"use client";

// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { RegisterButton } from "~~/components/Register";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useUser } from "~~/hooks/useUser";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();
  const { user, isLoading: isLoadingUser } = useUser();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        if (!connected) {
          return (
            <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
              Connect Wallet
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
          return <RegisterButton />;
        }

        return (
          <>
            <div className="flex flex-col items-center mr-1">
              <Balance address={account.address as Address} className="min-h-0 h-auto" />
              <span className="text-xs" style={{ color: networkColor }}>
                {chain.name}
              </span>
            </div>
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
