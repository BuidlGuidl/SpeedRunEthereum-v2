import { UserSocials } from "../_component/UserSocials";
import { PunkBlockie } from "~~/components/PunkBlockie";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { UserByAddress } from "~~/services/database/repositories/users";

export const UserProfileCard = ({ user, address }: { user: UserByAddress; address: string }) => {
  return (
    <div className="bg-base-100 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <PunkBlockie address={address} scale={2} />
        <div className="text-neutral">
          <Address address={address} hideAvatar size="xl" />
        </div>
        <hr className="w-full border-base-200 mb-2" />
        <UserSocials user={user} />
        <div className="text-sm text-neutral">
          Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
      </div>
    </div>
  );
};
