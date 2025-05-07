"use client";

import { UserLocation } from "./UserLocation";
import { UserSocials } from "./UserSocials";
import EditIcon from "~~/app/_assets/icons/EditIcon";
import { UPDATE_USER_MODAL_ID, UpdateUserModal } from "~~/app/_components/UpdateUserModal";
import { PunkBlockie } from "~~/components/PunkBlockie";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { useAuthSession } from "~~/hooks/useAuthSession";
import { UserByAddress } from "~~/services/database/repositories/users";

export const UserProfileCard = ({ user, address }: { user: NonNullable<UserByAddress>; address: string }) => {
  const { isAdmin } = useAuthSession();

  return (
    <div className="bg-base-100 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col md:flex-row justify-around lg:flex-col items-center gap-4">
        <PunkBlockie address={address} scale={2} />
        <div className="flex flex-col items-center gap-4">
          <div className="text-neutral">
            <Address address={address} hideAvatar size="xl" />
          </div>
          {isAdmin && (
            <>
              <label htmlFor={UPDATE_USER_MODAL_ID} className="btn btn-xs btn-outline w-full">
                <EditIcon className="w-3.5 h-3.5" />
                Edit Profile
              </label>
              <UpdateUserModal user={user} />
            </>
          )}
          <hr className="w-full border-base-200 mb-2" />
          <UserLocation user={user} />
          <UserSocials user={user} />
          <div className="text-sm text-neutral">
            Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
        </div>
      </div>
    </div>
  );
};
