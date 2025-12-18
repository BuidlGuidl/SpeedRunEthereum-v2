import { ChallengeDetails } from "./ChallengeDetails";
import { ChallengeDetailsStatus } from "./ChallengeDetailsStatus";
import { ChallengeIconComputer, ChallengeIconRocket } from "./ChallengeGroupIcons";
import { GroupedChallengeTitle } from "./GroupedChallengeTitle";
import "./groupedChallenges.css";
import { type Address } from "viem";
import { ChallengeId, ReviewAction } from "~~/services/database/config/types";
import type { Challenges } from "~~/services/database/repositories/challenges";
import type { UserChallenges } from "~~/services/database/repositories/userChallenges";

const basicChallengeIds = new Set<ChallengeId>([
  ChallengeId.TOKENIZATION,
  ChallengeId.CROWDFUNDING,
  ChallengeId.TOKEN_VENDOR,
  ChallengeId.DICE_GAME,
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
  userHasCompletedChallenges,
}: {
  address: Address;
  challenges: Challenges;
  userChallenges: UserChallenges;
  userHasCompletedChallenges: boolean;
}) {
  // Map challenges with user challenges
  const userMappedChallenges: MappedChallenges[] = challenges
    .map((challenge: Challenges[number]) => {
      const userChallenge = userChallenges.find(uc => uc.challengeId === challenge.id);

      if (!userChallenge) return challenge;

      return {
        ...challenge,
        reviewAction: userChallenge.reviewAction ?? null,
        submittedAt: userChallenge.submittedAt ?? null,
        reviewComment: userChallenge.reviewComment ?? null,
        contractUrl: userChallenge.contractUrl ?? null,
        frontendUrl: userChallenge.frontendUrl ?? null,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Filter challenges into basic and advanced
  const basicChallenges = userMappedChallenges.filter(challenge => basicChallengeIds.has(challenge.id as ChallengeId));
  const advancedChallenges = userMappedChallenges.filter(
    challenge => !basicChallengeIds.has(challenge.id as ChallengeId),
  );

  return (
    <div>
      <div className="collapse collapse-arrow bg-base-300 rounded-lg">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title text-base font-medium">
          <GroupedChallengeTitle title="Ethereum 101" icon={<ChallengeIconComputer />} challenges={basicChallenges} />
        </div>
        <div className="collapse-content px-3 bg-base-100">
          <div className="mt-3 space-y-4 divide-y">
            {basicChallenges.map(challenge => {
              if (challenge.reviewAction) {
                return <ChallengeDetailsStatus key={challenge.id} challenge={challenge} />;
              }

              return <ChallengeDetails key={challenge.id} address={address} challenge={challenge} />;
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 collapse collapse-arrow bg-base-300 rounded-lg">
        <input type="checkbox" defaultChecked={userHasCompletedChallenges} />
        <div className="collapse-title text-base font-medium">
          <GroupedChallengeTitle
            title="Advanced Concepts"
            icon={<ChallengeIconRocket />}
            challenges={advancedChallenges}
          />
        </div>
        <div className="collapse-content px-3 bg-base-100">
          <div className="mt-3 space-y-4 divide-y">
            {advancedChallenges.map(challenge => {
              if (challenge.reviewAction) {
                return <ChallengeDetailsStatus key={challenge.id} challenge={challenge} />;
              }

              return (
                <ChallengeDetails
                  key={challenge.id}
                  address={address}
                  challenge={challenge}
                  comingSoon={challenge.id === ChallengeId.ORACLES}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
