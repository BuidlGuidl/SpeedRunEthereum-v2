"use client";

import { UserSocials } from "./UserSocials";
import { getAddress, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { AddressCopyIcon } from "~~/components/scaffold-eth/Address/AddressCopyIcon";
import { UserByAddress } from "~~/services/database/repositories/users";

export const UserAddress = ({ user }: { user: NonNullable<UserByAddress> }) => {
  const checkSumAddress = user.userAddress ? getAddress(user.userAddress) : undefined;

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
            width: 100,
            height: 100,
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
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <div className="rounded-full border-4 border-base-100">
          <BlockieAvatar address={checkSumAddress} ensImage={ensAvatar} size={100} />
        </div>
      </div>
      <div>
        {isEnsNameLoading && (
          <div className={"skeleton rounded-lg font-bold"}>
            <div className="invisible">{shortAddress}</div>
          </div>
        )}
        {!isEnsNameLoading && ens && <p className={"m-0 font-semibold text-lg"}>{ens || "pabl0cks.eth"}</p>}
        <div className="mb-2 flex items-center">
          <p className="m-0 font-normal text-lg">{shortAddress}</p>
          <AddressCopyIcon className={"ml-1 cursor-pointer w-4 h-4"} address={checkSumAddress} />
        </div>
        <UserSocials user={user} />
      </div>
    </div>
  );
};
