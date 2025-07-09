import Link from "next/link";
import type { MappedChallenges } from "./GroupedChallenges";
import type { UserChallenges } from "~~/services/database/repositories/userChallenges";
import { getChallengeDependenciesInfo } from "~~/utils/dependent-challenges";

export function ChallengeDetails({
  challenge,
  userChallenges,
}: {
  challenge: MappedChallenges;
  userChallenges: UserChallenges;
}) {
  const { completed: builderHasCompletedDependenciesChallenges } = getChallengeDependenciesInfo({
    dependencies: challenge.dependencies || [],
    userChallenges,
  });

  const isChallengeLocked = challenge.disabled || !builderHasCompletedDependenciesChallenges;

  return (
    <div className="text-base-content/50 hover:text-base-content transition">
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-base-300 rounded-full font-semibold dark:bg-base-200">
            {challenge.sortOrder}
          </div>
          <h2 className="m-0 font-medium">
            {!isChallengeLocked && (
              <Link href={`/challenge/${challenge.id}`} className="hover:underline">
                {challenge.challengeName}
              </Link>
            )}
            {isChallengeLocked && challenge.challengeName}
          </h2>
        </div>
        {isChallengeLocked && (
          <button disabled className="btn btn-sm opacity-75 disabled:bg-accent disabled:text-accent-content">
            Locked
          </button>
        )}
        {!isChallengeLocked && (
          <Link href={`/challenge/${challenge.id}`} className="btn btn-primary btn-sm">
            Start
          </Link>
        )}
      </div>
      <div className="pl-10">
        <p>{challenge.description}</p>
      </div>
    </div>
  );
}
