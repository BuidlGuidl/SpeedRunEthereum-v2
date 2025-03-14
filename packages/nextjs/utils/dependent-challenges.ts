import { ChallengeId, ReviewAction } from "~~/services/database/config/types";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";

const getLockReasonTooltip = ({
  dependencies,
  userChallenges,
}: {
  dependencies?: string[];
  userChallenges: UserChallenges;
}) => {
  const pendingDependenciesChallenges = dependencies?.filter(dependency => {
    return (
      !userChallenges.find(userChallenge => userChallenge.challengeId === dependency)?.reviewAction ||
      userChallenges.find(userChallenge => userChallenge.challengeId === dependency)?.reviewAction !==
        ReviewAction.ACCEPTED
    );
  });

  if (pendingDependenciesChallenges && pendingDependenciesChallenges.length > 0) {
    return "The following challenges are not completed: " + pendingDependenciesChallenges?.join(", ");
  }
  return "";
};

export const getChallengeDependenciesInfo = ({
  dependencies,
  userChallenges,
}: {
  dependencies: string[];
  userChallenges: UserChallenges;
}) => {
  const lockReasonToolTip = getLockReasonTooltip({
    dependencies,
    userChallenges,
  });

  return { completed: !lockReasonToolTip, lockReasonToolTip };
};

export const JOIN_BG_DEPENDENCIES = [
  ChallengeId.SIMPLE_NFT_EXAMPLE,
  ChallengeId.DECENTRALIZED_STAKING,
  ChallengeId.TOKEN_VENDOR,
  ChallengeId.DICE_GAME,
  ChallengeId.MINIMUM_VIABLE_EXCHANGE,
];
