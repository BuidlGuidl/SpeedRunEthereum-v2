"use client";

import { Address as AddressType, getAddress, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { AddressCopyIcon } from "~~/components/scaffold-eth/Address/AddressCopyIcon";

type UserAddressProps = {
  address: AddressType;
};

export const UserAddress = ({ address }: UserAddressProps) => {
  const checkSumAddress = address ? getAddress(address) : undefined;

  const { data: ens, isLoading: isEnsNameLoading } = useEnsName({
    address: checkSumAddress,
    chainId: 1,
    query: {
      enabled: isAddress(checkSumAddress ?? ""),
    },
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ens ? normalize(ens) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(ens),
      gcTime: 30_000,
    },
  });

  const shortAddress = checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4);

  if (!checkSumAddress) {
    return (
      <div className="flex items-center">
        <div
          className="flex-shrink-0 skeleton rounded-full"
          style={{
            width: 72,
            height: 72,
          }}
        ></div>
        <div className="flex flex-col space-y-1">
          <div className={`ml-1.5 skeleton rounded-lg`}>
            <span className="invisible">0x1234...56789</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAddress(checkSumAddress)) {
    return <span className="text-error">Wrong address</span>;
  }

  return (
    <div className="flex items-center gap-5">
      <div className="flex-shrink-0">
        <BlockieAvatar address={checkSumAddress} ensImage={ensAvatar} size={72} />
      </div>
      <div className="">
        {isEnsNameLoading && (
          <div className={"skeleton rounded-lg font-bold"}>
            <span className="invisible">{shortAddress}</span>
          </div>
        )}
        {!isEnsNameLoading && ens && <p className={"font-semibold text-lg"}>{ens}</p>}
        <div className={"flex items-center"}>
          <span className={"font-normal text-lg"}>{shortAddress}</span>
          <AddressCopyIcon className={"ml-1 cursor-pointer w-4 h-4"} address={checkSumAddress} />
        </div>
      </div>
    </div>
  );
};
