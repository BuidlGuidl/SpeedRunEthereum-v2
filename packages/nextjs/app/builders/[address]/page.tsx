import { UserChallengesTable } from "../_component/UserChallengesTable";
import PunkBlockie from "~~/components/PunkBlockie";
import { findUserChallengesByAddress } from "~~/services/database/repositories/userChallenges";

export default async function BuilderPage({ params }: { params: { address: string } }) {
  const { address: userAddress } = params;
  const challenges = await findUserChallengesByAddress(userAddress);

  return (
    <div>
      <PunkBlockie address={userAddress} scale={2} />
      <UserChallengesTable challenges={challenges} />
    </div>
  );
}
