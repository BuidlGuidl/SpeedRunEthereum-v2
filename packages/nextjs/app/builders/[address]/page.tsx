import { UserChallengesTable } from "../_component/UserChallengesTable";
import { UserSocials } from "../_component/UserSocials";
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
    <div className="flex flex-col gap-8">
      <UserSocials user={user} />
      <UserChallengesTable challenges={challenges} />
    </div>
  );
}
