import { ChallengeDetails } from "./ChallengeDetails";
import { ChallengeDetailsStatus } from "./ChallengeDetailsStatus";
import { ChallengeIconComputer } from "./ChallengeGroupIcons";
import { ReviewAction } from "~~/services/database/config/types";
import type { Challenges } from "~~/services/database/repositories/challenges";
import type { UserChallenges } from "~~/services/database/repositories/userChallenges";

const basicChallengeIds = new Set(["simple-nft-example", "decentralized-staking", "token-vendor"]);

export type MappedChallenges = Challenges[number] & {
  reviewAction?: ReviewAction | null;
  submittedAt?: Date;
  reviewComment?: string | null;
  contractUrl?: string | null;
  frontendUrl?: string | null;
};

export function GroupedChallenges({
  challenges,
  userChallenges,
}: {
  challenges: Challenges;
  userChallenges: UserChallenges;
}) {
  // Map challenges with user challenges
  const userMappedChallenges: MappedChallenges[] = challenges.map((challenge: Challenges[number]) => {
    if (userChallenges.find(userChallenge => userChallenge.challengeId === challenge.id)) {
      return {
        ...challenge,
        reviewAction:
          userChallenges.find(userChallenge => userChallenge.challengeId === challenge.id)?.reviewAction || null,
        submittedAt:
          userChallenges.find(userChallenge => userChallenge.challengeId === challenge.id)?.submittedAt || new Date(),
        reviewComment:
          userChallenges.find(userChallenge => userChallenge.challengeId === challenge.id)?.reviewComment || null,
        contractUrl:
          userChallenges.find(userChallenge => userChallenge.challengeId === challenge.id)?.contractUrl || null,
        frontendUrl:
          userChallenges.find(userChallenge => userChallenge.challengeId === challenge.id)?.frontendUrl || null,
      };
    }

    return challenge;
  });

  // Filter challenges into basic and advanced
  const basicChallenges = userMappedChallenges.filter(challenge => basicChallengeIds.has(challenge.id));
  const advancedChallenges = userMappedChallenges.filter(challenge => !basicChallengeIds.has(challenge.id));

  return (
    <div>
      <div className="collapse collapse-arrow bg-base-300 rounded-lg">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title text-xl font-medium">
          <div className="flex items-center gap-2">
            <ChallengeIconComputer />
            Basic Challenges
          </div>
        </div>
        <div className="collapse-content bg-base-100">
          <div className="mt-6 space-y-6 divide-y">
            {basicChallenges.map(challenge => {
              if (challenge.reviewAction) {
                return <ChallengeDetailsStatus challenge={challenge} key={challenge.id} />;
              }

              return <ChallengeDetails challenge={challenge} key={challenge.id} />;
            })}
          </div>
        </div>
      </div>
      <div className="mt-6 collapse collapse-arrow bg-base-300 rounded-lg">
        <input type="checkbox" />
        <div className="collapse-title text-xl font-medium">
          <div className="flex items-center gap-2">
            <ChallengeIconComputer />
            Advanced Challenges
          </div>
        </div>
        <div className="collapse-content bg-base-100">
          <div className="mt-6 space-y-6 divide-y">
            {advancedChallenges.map(challenge => {
              if (challenge.reviewAction) {
                return <ChallengeDetailsStatus challenge={challenge} key={challenge.id} />;
              }

              return <ChallengeDetails challenge={challenge} key={challenge.id} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
