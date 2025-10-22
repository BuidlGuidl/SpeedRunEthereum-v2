"use client";

import { UserLocation } from "./UserLocation";
import { UserNotesIndicator } from "./UserNotesIndicator";
import { UserSocials } from "./UserSocials";
import EditIcon from "~~/app/_assets/icons/EditIcon";
import { UPDATE_USER_MODAL_ID, UpdateUserModal } from "~~/app/_components/UpdateUserModal";
import { UserNotesModal } from "~~/app/_components/UserNotesModal";
import { PunkBlockie } from "~~/components/PunkBlockie";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { useAuthSession } from "~~/hooks/useAuthSession";
import { BatchUserStatus } from "~~/services/database/config/types";
import { Batch } from "~~/services/database/repositories/batches";
import { UserByAddress } from "~~/services/database/repositories/users";

type UserProfileCardProps = {
  user: NonNullable<UserByAddress>;
  batch: Batch;
};

export const UserProfileCard = ({ user, batch }: UserProfileCardProps) => {
  const { isAdmin } = useAuthSession();

  return (
    <>
      <div className="bg-base-100 rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-around lg:flex-col items-center gap-4">
          <div className="relative">
            {user.ensAvatar ? (
              <div className="w-[224px] h-[224px] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.ensAvatar} alt={user.userAddress} className="absolute inset-0" />
              </div>
            ) : (
              <PunkBlockie address={user.userAddress} scale={2} />
            )}
            {isAdmin && <UserNotesIndicator user={user} />}
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="text-neutral">
              <Address address={user.userAddress} hideAvatar size="xl" cachedEns={user.ens} />
            </div>

            {batch && (
              <div
                className={`-mt-1 rounded-sm px-2 py-0.5 fon t-semibold ${
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

            <hr className="w-full border-base-200 mb-2" />
            <UserLocation user={user} />
            <UserSocials user={user} />
            <div className="text-sm text-neutral">
              Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
        <UpdateUserModal user={user} />
        {isAdmin && <UserNotesModal user={user} />}
      </div>
    </>
  );
};
