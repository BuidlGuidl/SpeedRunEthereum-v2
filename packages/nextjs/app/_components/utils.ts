import { Challenge, ChallengeAttempt } from "../_types/User";
import { ReviewAction } from "~~/services/database/config/types";

export const getDepsChallengesCompleted = (
  challenge: Pick<Challenge, "dependencies">,
  builderAttemptedChallenges: Record<string, ChallengeAttempt>,
) =>
  challenge.dependencies?.every(name => {
    if (!builderAttemptedChallenges[name]) {
      return false;
    }
    if (!(builderAttemptedChallenges[name].status === ReviewAction.ACCEPTED)) {
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
  builderAttemptedChallenges,
}: {
  dependencies?: string[];
  builderAttemptedChallenges: Record<string, ChallengeAttempt>;
}) => {
  const pendingDependenciesChallenges = dependencies?.filter(dependency => {
    return (
      !builderAttemptedChallenges[dependency] || builderAttemptedChallenges[dependency].status !== ReviewAction.ACCEPTED
    );
  });

  if (pendingDependenciesChallenges && pendingDependenciesChallenges.length > 0) {
    return "The following challenges are not completed: " + pendingDependenciesChallenges?.join(", ");
  }
  return "";
};

export const getChallengeDependenciesInfo = ({
  dependencies,
  builderAttemptedChallenges,
}: {
  dependencies: string[];
  builderAttemptedChallenges: Record<string, ChallengeAttempt>;
}) => {
  const lockReasonToolTip = getLockReasonTooltip({
    dependencies,
    builderAttemptedChallenges,
  });

  return { completed: !lockReasonToolTip, lockReasonToolTip };
};
