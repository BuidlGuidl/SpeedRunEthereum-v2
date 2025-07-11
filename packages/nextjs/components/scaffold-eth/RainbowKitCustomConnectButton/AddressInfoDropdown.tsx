import { useRef, useState } from "react";
import Link from "next/link";
import { AdminMenuItems } from "./AdminMenuItems";
import { NetworkOptions } from "./NetworkOptions";
import { signOut } from "next-auth/react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Address, getAddress } from "viem";
import { useDisconnect } from "wagmi";
import {
  ArrowLeftEndOnRectangleIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar, isENS } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  isAdmin: boolean;
  ensAvatar?: string | null;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  isAdmin,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);

  const [addressCopied, setAddressCopied] = useState(false);

  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary
          tabIndex={0}
          className="btn btn-secondary min-h-0 py-1 lg:py-2 px-2 border-2 !border-primary shadow-md dropdown-toggle gap-0 !h-auto"
        >
          <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
          <span className="ml-2 mr-1 text-sm lg:text-base font-medium">
            {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
          </span>
          <ChevronDownIcon className="h-6 w-4" />
        </summary>
        <ul
          tabIndex={0}
          className="dropdown-content menu z-[2] p-2 mt-2 shadow-center shadow-accent bg-base-200 rounded-box gap-1"
        >
          {isAdmin && (
            <>
              <div className="text-sm font-semibold opacity-60 ml-3">Admin</div>
              <AdminMenuItems closeDropdown={closeDropdown} />
              <hr className="my-1 border-primary/50" />
              <div className="text-sm font-semibold opacity-60 ml-3">Account</div>
            </>
          )}

          <NetworkOptions hidden={!selectingNetwork} />
          <li>
            <Link href={`/builders/${address}`} className="btn-sm !rounded-xl flex gap-3 py-3" onClick={closeDropdown}>
              <UserIcon className="h-6 w-4" />
              <span className="whitespace-nowrap">My Portfolio</span>
            </Link>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            {addressCopied ? (
              <div className="btn-sm !rounded-xl flex gap-3 py-3">
                <CheckCircleIcon className="text-xl font-normal h-6 w-4 cursor-pointer" aria-hidden="true" />
                <span className=" whitespace-nowrap">Copy address</span>
              </div>
            ) : (
              <CopyToClipboard
                text={checkSumAddress}
                onCopy={() => {
                  setAddressCopied(true);
                  setTimeout(() => {
                    setAddressCopied(false);
                  }, 800);
                }}
              >
                <div className="btn-sm !rounded-xl flex gap-3 py-3">
                  <DocumentDuplicateIcon className="text-xl font-normal h-6 w-4 cursor-pointer" aria-hidden="true" />
                  <span className=" whitespace-nowrap">Copy address</span>
                </div>
              </CopyToClipboard>
            )}
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <label htmlFor="qrcode-modal" className="btn-sm !rounded-xl flex gap-3 py-3">
              <QrCodeIcon className="h-6 w-4" />
              <span className="whitespace-nowrap">View QR Code</span>
            </label>
          </li>
          {allowedNetworks.length > 1 ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="btn-sm !rounded-xl flex gap-3 py-3"
                type="button"
                onClick={() => {
                  setSelectingNetwork(true);
                }}
              >
                <ArrowsRightLeftIcon className="h-6 w-4" /> <span>Switch Network</span>
              </button>
            </li>
          ) : null}
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item text-error btn-sm !rounded-xl flex gap-3 py-3"
              type="button"
              onClick={() => {
                disconnect();
                signOut();
              }}
            >
              <ArrowLeftEndOnRectangleIcon className="h-6 w-4" /> <span>Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  );
};
