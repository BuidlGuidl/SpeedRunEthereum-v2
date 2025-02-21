import { ReviewAction } from "~~/services/database/config/types";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";

// TODO: update deps later
export const getDepsChallengesCompleted = (deps: { dependencies: string[] }, userChallenges: UserChallenges) =>
  deps.dependencies?.every(name => {
    if (!userChallenges.find(userChallenge => userChallenge.challengeId === name)?.reviewAction) {
      return false;
    }
    if (
      !(
        userChallenges.find(userChallenge => userChallenge.challengeId === name)?.reviewAction === ReviewAction.ACCEPTED
      )
    ) {
      return false;
    }
    // TODO: is this needed?
    // if (challenge.lockedTimestamp) {
    //   return (
    //     new Date().getTime() - builderAttemptedChallenges[name].submittedTimestamp > challenge.lockedTimestamp * 60 * 1000
    //   );
    // }

    return true;
  });

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
