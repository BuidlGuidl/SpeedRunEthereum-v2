import { ChallengeDetails } from "./ChallengeDetails";
import { ChallengeDetailsStatus } from "./ChallengeDetailsStatus";
import { ChallengeIconComputer, ChallengeIconRocket } from "./ChallengeGroupIcons";
import { type Address } from "viem";
import { ChallengeId, ReviewAction } from "~~/services/database/config/types";
import type { Challenges } from "~~/services/database/repositories/challenges";
import type { UserChallenges } from "~~/services/database/repositories/userChallenges";

const basicChallengeIds = new Set<ChallengeId>([
  ChallengeId.SIMPLE_NFT_EXAMPLE,
  ChallengeId.DECENTRALIZED_STAKING,
  ChallengeId.TOKEN_VENDOR,
]);

export type MappedChallenges = Challenges[number] & {
  reviewAction?: ReviewAction | null;
  submittedAt?: Date;
  reviewComment?: string | null;
  contractUrl?: string | null;
  frontendUrl?: string | null;
};

export function GroupedChallenges({
  address,
  challenges,
  userChallenges,
}: {
  address: Address;
  challenges: Challenges;
  userChallenges: UserChallenges;
}) {
  // Map challenges with user challenges
  const userMappedChallenges: MappedChallenges[] = challenges
    .map((challenge: Challenges[number]) => {
      const userChallenge = userChallenges.find(uc => uc.challengeId === challenge.id);

      if (!userChallenge) return challenge;

      return {
        ...challenge,
        reviewAction: userChallenge.reviewAction ?? null,
        submittedAt: userChallenge.submittedAt ?? new Date(),
        reviewComment: userChallenge.reviewComment ?? null,
        contractUrl: userChallenge.contractUrl ?? null,
        frontendUrl: userChallenge.frontendUrl ?? null,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter(challenge => {
      return (
        challenge.id !== ChallengeId.STATE_CHANNELS &&
        challenge.id !== ChallengeId.STABLECOINS &&
        challenge.id !== ChallengeId.DEPLOY_TO_L2
      );
    });

  // Filter challenges into basic and advanced
  const basicChallenges = userMappedChallenges.filter(challenge => basicChallengeIds.has(challenge.id as ChallengeId));
  const advancedChallenges = userMappedChallenges.filter(
    challenge => !basicChallengeIds.has(challenge.id as ChallengeId),
  );

  return (
    <div>
      <div className="collapse collapse-arrow bg-base-300 rounded-lg">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title text-xl font-medium">
          <div className="flex items-center gap-3">
            <ChallengeIconComputer />
            Ethereum 101
          </div>
        </div>
        <div className="collapse-content bg-base-100">
          <div className="mt-6 space-y-6 divide-y">
            {basicChallenges.map(challenge => {
              if (challenge.reviewAction) {
                return <ChallengeDetailsStatus key={challenge.id} challenge={challenge} />;
              }

              return (
                <ChallengeDetails
                  key={challenge.id}
                  address={address}
                  challenge={challenge}
                  userChallenges={userChallenges}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-6 collapse collapse-arrow bg-base-300 rounded-lg">
        <input type="checkbox" />
        <div className="collapse-title text-xl font-medium">
          <div className="flex items-center gap-3">
            <ChallengeIconRocket />
            Advanced Concepts
          </div>
        </div>
        <div className="collapse-content bg-base-100">
          <div className="mt-6 space-y-6 divide-y">
            {advancedChallenges.map(challenge => {
              if (challenge.reviewAction) {
                return <ChallengeDetailsStatus key={challenge.id} challenge={challenge} />;
              }

              return (
                <ChallengeDetails
                  key={challenge.id}
                  address={address}
                  challenge={challenge}
                  userChallenges={userChallenges}
                  comingSoon={challenge.id === ChallengeId.DEPLOY_TO_L2}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
