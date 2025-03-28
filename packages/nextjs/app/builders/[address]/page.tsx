import { UpgradedToBGCard } from "./_components/UpgradedToBGCard";
import { UserChallengesTable } from "./_components/UserChallengesTable";
import { UserProfileCard } from "./_components/UserProfileCard";
import { isV1BuilderExists } from "~~/services/api-sre-v1/builders";
import { findLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";
import { findUserByAddress } from "~~/services/database/repositories/users";

export default async function BuilderPage({ params }: { params: { address: string } }) {
  const { address: userAddress } = params;
  const challenges = await findLatestSubmissionPerChallengeByUser(userAddress);
  const users = await findUserByAddress(userAddress);
  const user = users[0];
  const v1BuilderExists = await isV1BuilderExists(userAddress);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-14">
        <div className="lg:col-span-1">
          <UserProfileCard user={user} address={userAddress} />
        </div>
        <div className="lg:col-span-3">
          {v1BuilderExists && <UpgradedToBGCard user={user} />}
          <h2 className="text-2xl font-bold mb-0 text-neutral pb-4">Challenges</h2>
          {challenges.length > 0 ? (
            <UserChallengesTable challenges={challenges} />
          ) : (
            <div className="bg-base-100 p-8 text-center rounded-lg text-neutral">
              This builder hasn&apos;t completed any challenges.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
