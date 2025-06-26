"use client";

// import { UserLocation } from "./UserLocation";
import { UserAddress } from "./UserAddress";
import EditIcon from "~~/app/_assets/icons/EditIcon";
import { UPDATE_USER_MODAL_ID, UpdateUserModal } from "~~/app/_components/UpdateUserModal";
// import { PunkBlockie } from "~~/components/PunkBlockie";
import { useAuthSession } from "~~/hooks/useAuthSession";
import { BatchUserStatus } from "~~/services/database/config/types";
import { Batch } from "~~/services/database/repositories/batches";
import { UserByAddress } from "~~/services/database/repositories/users";

export const UserProfileCard = ({ user, batch }: { user: NonNullable<UserByAddress>; batch: Batch }) => {
  const { isAdmin } = useAuthSession();

  return (
    <div>
      {batch && (
        <div
          className={`mb-2 inline-block rounded-sm px-2 py-0.5 font-semibold ${
            user.batchStatus === BatchUserStatus.GRADUATE
              ? "bg-green-500/30"
              : "text-yellow-600 dark:text-yellow-400 bg-warning/30"
          }`}
        >
          {batch.name.toString().toUpperCase()}
        </div>
      )}
      <div className="bg-base-100 p-4 rounded-xl flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          {/* <PunkBlockie address={user.userAddress} className="rounded-full" scale={1} /> */}
          <div className="flex flex-col gap-3 text-neutral">
            <UserAddress user={user} />
          </div>
        </div>
        <div className="text-center md:text-right">
          {/* <UserLocation user={user} /> */}
          {isAdmin && (
            <>
              <label htmlFor={UPDATE_USER_MODAL_ID} className="my-2 btn btn-xs btn-outline w-full">
                <EditIcon className="w-3.5 h-3.5" />
                Edit Profile
              </label>
            </>
          )}
        </div>
      </div>
      <UpdateUserModal user={user} />
    </div>
  );
};
