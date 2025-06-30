"use client";

// import { UserLocation } from "./UserLocation";
import { UserAddress } from "./UserAddress";
import EditIcon from "~~/app/_assets/icons/EditIcon";
import { UPDATE_USER_MODAL_ID, UpdateUserModal } from "~~/app/_components/UpdateUserModal";
// import { PunkBlockie } from "~~/components/PunkBlockie";
import { useAuthSession } from "~~/hooks/useAuthSession";
import { UserByAddress } from "~~/services/database/repositories/users";

export const UserProfileCard = ({ user }: { user: NonNullable<UserByAddress> }) => {
  const { isAdmin } = useAuthSession();

  return (
    <div>
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
