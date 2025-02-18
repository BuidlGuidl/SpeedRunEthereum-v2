import { UserChallengesTable } from "../_component/UserChallengesTable";
import { findUserChallengesByAddress } from "~~/services/database/repositories/userChallenges";

export default async function BuilderPage({ params }: { params: { address: string } }) {
  const { address: userAddress } = params;
  const challenges = await findUserChallengesByAddress(userAddress);

  return <UserChallengesTable challenges={challenges} />;
}
