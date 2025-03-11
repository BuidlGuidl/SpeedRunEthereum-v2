import { UserChallengesTable } from "../_component/UserChallengesTable";
import { UserProfileCard } from "../_components/UserProfileCard";
import { UserProfileHeader } from "../_components/UserProfileHeader";
import { findUserChallengesByAddress } from "~~/services/database/repositories/userChallenges";
import { findUserByAddress } from "~~/services/database/repositories/users";

export default async function BuilderPage({ params }: { params: { address: string } }) {
  const { address: userAddress } = params;
  const challenges = await findUserChallengesByAddress(userAddress);
  const users = await findUserByAddress(userAddress);
  const user = users[0];

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-14">
        <div className="md:col-span-1">
          <UserProfileCard user={user} address={userAddress} />
        </div>
        <div className="md:col-span-3">
          <div className="flex flex-col gap-8">
            <UserProfileHeader challengesCount={challenges.length} />
            <UserChallengesTable challenges={challenges} />
          </div>
        </div>
      </div>
    </div>
  );
}
