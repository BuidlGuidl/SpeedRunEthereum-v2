"use client";

import { RefreshEnsButton } from "./RefreshEnsButton";
import { UserSocials } from "./UserSocials";
import EditIcon from "~~/app/_assets/icons/EditIcon";
import { UPDATE_USER_MODAL_ID, UpdateUserModal } from "~~/app/_components/UpdateUserModal";
import { PunkBlockie } from "~~/components/PunkBlockie";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { useAuthSession } from "~~/hooks/useAuthSession";
import { BatchUserStatus } from "~~/services/database/config/types";
import { Batch } from "~~/services/database/repositories/batches";
import { UserByAddress } from "~~/services/database/repositories/users";

export const UserProfileCard = ({ user, batch }: { user: NonNullable<UserByAddress>; batch: Batch }) => {
  const { isAdmin } = useAuthSession();

  return (
    <div className="bg-base-100 rounded-xl p-6">
      <div className="flex flex-col md:flex-row justify-around lg:flex-col items-center gap-4">
        <PunkBlockie address={user.userAddress} scale={2} />
        <div className="flex flex-col items-center gap-4">
          <div className="text-neutral">
            <Address address={user.userAddress} hideAvatar size="xl" cachedEns={user.ens} />
            <div className="text-center">
              <RefreshEnsButton user={user} />
            </div>
          </div>

          {batch && (
            <div
              className={`-mt-1 rounded-sm px-2 py-0.5 font-semibold ${
                user.batchStatus === BatchUserStatus.GRADUATE
                  ? "bg-green-500/30"
                  : "text-yellow-600 dark:text-yellow-400 bg-warning/30"
              }`}
            >
              {batch.name.toString().toUpperCase()}
            </div>
          )}

          {isAdmin && (
            <>
              <label htmlFor={UPDATE_USER_MODAL_ID} className="btn btn-xs btn-outline w-full">
                <EditIcon className="w-3.5 h-3.5" />
                Edit Profile
              </label>
            </>
          )}

          <UserSocials user={user} />
        </div>
      </div>
      <UpdateUserModal user={user} />
    </div>
  );
};
