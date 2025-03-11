import { UserSocials } from "../_component/UserSocials";
import { PunkBlockie } from "~~/components/PunkBlockie";
import { UserByAddress } from "~~/services/database/repositories/users";

export const UserProfileCard = ({ user, address }: { user: UserByAddress; address: string }) => {
  return (
    <div className="bg-base-100 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <PunkBlockie address={address} scale={2} />
        <div className="text-xl font-bold">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <div className="text-sm text-neutral-content">
          Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <UserSocials user={user} />
      </div>
    </div>
  );
};
