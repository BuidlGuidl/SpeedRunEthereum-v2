import Image from "next/image";
import Link from "next/link";
import { getChallengeDependenciesInfo } from "../../utils/dependent-challenges";
import CrossedSwordsIcon from "../_assets/icons/CrossedSwordsIcon";
import NewIcon from "../_assets/icons/NewIcon";
import PadLockIcon from "../_assets/icons/PadLockIcon";
import QuestionIcon from "../_assets/icons/QuestionIcon";
import { ChallengeId } from "~~/services/database/config/types";
import { Challenges } from "~~/services/database/repositories/challenges";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";
import { REVIEW_ACTION_BADGE_CLASSES } from "~~/utils/challenges";

type ChallengeExpandedCardProps = {
  challengeId: ChallengeId;
  userChallenges?: UserChallenges;
  challenges: Challenges;
  comingSoon?: boolean;
};

const ChallengeExpandedCard = ({
  challengeId,
  userChallenges = [],
  challenges = [],
  comingSoon,
}: ChallengeExpandedCardProps) => {
  const challenge = challenges.find(c => c.id === challengeId);

  const userChallenge = userChallenges.find(userChallenge => userChallenge.challengeId === challengeId);
  if (!challenge) {
    return null;
  }

  const { sortOrder } = challenge;
  const { completed: builderHasCompletedDependenciesChallenges, lockReasonTooltip } = getChallengeDependenciesInfo({
    dependencies: challenge.dependencies || [],
    userChallenges,
  });

  const reviewAction = userChallenge?.reviewAction;
  const isChallengeLocked = challenge.disabled || !builderHasCompletedDependenciesChallenges;

  return (
    <div className="challenge-expanded-card flex justify-center group relative">
      <div className="flex justify-between max-w-7xl py-8 mx-10 sm:mx-14 pl-10 border-primary border-l-[3px] sm:border-l-[5px] relative flex-col-reverse lg:flex-row border-b-2 group-[:not(:has(+.challenge-expanded-card))]:border-b-0">
        <div className="hidden group-first:block absolute -left-3 z-10 top-0 w-[18px] h-[57%] sm:h-[50%] bg-base-200" />
        <div className="flex flex-col max-w-full lg:max-w-[40%] gap-18 lg:gap-20">
          <div className="flex flex-col items-start gap-0">
            <div className="h-6">
              {reviewAction && (
                <span className={`badge ${REVIEW_ACTION_BADGE_CLASSES[reviewAction]}`}>
                  {reviewAction.toLowerCase()}
                </span>
              )}
            </div>

            <span className="text-lg">Challenge #{sortOrder}</span>
            <h2 className="text-xl lg:text-2xl font-medium mt-0">{challenge.challengeName}</h2>
          </div>
          <div className="flex flex-col gap-8">
            <span className="text-sm lg:text-base leading-[1.5]">{challenge.description}</span>
            <div className="flex items-center">
              {comingSoon && (
                <button
                  disabled
                  className="inline-flex items-center text-xl lg:text-lg px-4 py-1 border-2 border-primary rounded-full bg-base-300 opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <NewIcon className="w-6 h-6" />
                    <span className="ml-2 uppercase font-medium">Coming soon</span>
                  </div>
                </button>
              )}

              {!comingSoon && challenge.externalLink?.link && (
                // Redirect to externalLink if set (instead of challenge detail view)
                <>
                  <button
                    className={`flex items-center text-xl lg:text-lg px-4 py-1 border-2 border-primary rounded-full bg-base-300 ${
                      isChallengeLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/50 transition-colors"
                    }`}
                    disabled={isChallengeLocked}
                  >
                    {builderHasCompletedDependenciesChallenges ? (
                      <a href={challenge.externalLink.link} target="_blank" rel="noopener noreferrer">
                        {challenge.externalLink.claim}
                      </a>
                    ) : (
                      <div className="flex items-center">
                        <PadLockIcon className="w-4 h-4 sm:w-6 sm:h-6 mr-2" />
                        <span className="ml-1 uppercase text-sm sm:text-lg">Locked</span>
                      </div>
                    )}
                  </button>
                  {!builderHasCompletedDependenciesChallenges && (
                    <div
                      className="tooltip tooltip-top tooltip-auto relative cursor-pointer ml-1 before:max-w-[min(calc(100vw-96px),300px)] before:whitespace-normal before:break-words before:text-sm"
                      data-tip={lockReasonTooltip}
                    >
                      <QuestionIcon className="ml-1 h-5 w-5 sm:w-8 sm:h-8" />
                    </div>
                  )}
                </>
              )}

              {!comingSoon && !challenge.externalLink?.link && (
                <>
                  {isChallengeLocked ? (
                    <button
                      disabled
                      className="flex items-center text-xl lg:text-lg px-4 py-1 border-2 border-primary rounded-full bg-base-300 opacity-50 cursor-not-allowed whitespace-nowrap"
                    >
                      <div className="flex items-center">
                        <PadLockIcon className="w-4 h-4 sm:w-6 sm:h-6 mr-2" />
                        <span className="uppercase font-medium text-sm sm:text-lg">Locked</span>
                      </div>
                    </button>
                  ) : (
                    <Link
                      href={`/challenge/${challengeId}`}
                      className="flex items-center text-xl lg:text-lg px-4 py-1 border-2 border-primary rounded-full bg-base-300 cursor-pointer hover:bg-accent/50"
                    >
                      <div className="flex items-center">
                        <CrossedSwordsIcon className="w-4 h-4 sm:h-6 sm:w-6" />
                        <span className="ml-2 uppercase font-medium text-sm sm:text-lg">Quest</span>
                      </div>
                    </Link>
                  )}
                  {!builderHasCompletedDependenciesChallenges && (
                    <div
                      className="tooltip tooltip-top tooltip-auto relative cursor-pointer ml-1 before:max-w-[min(calc(100vw-96px),300px)] before:whitespace-normal before:break-words before:text-sm"
                      data-tip={lockReasonTooltip}
                    >
                      <QuestionIcon className="ml-1 h-5 w-5 sm:w-8 sm:h-8" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center mb-0 lg:mb-0">
          {challenge.previewImage ? (
            <Image
              src={challenge.previewImage}
              alt={challenge.challengeName}
              // workaround to avoid console warnings
              className="w-full max-w-[490px] h-auto lg:mr-12"
              width={0}
              height={0}
            />
          ) : (
            <p className="p-3 text-center">{challengeId} image</p>
          )}
        </div>
        <span className="absolute h-3 w-3 sm:h-5 sm:w-5 rounded-full bg-base-300 border-primary border-2 lg:border-4 top-[57%] sm:top-[50%] -left-[8px] sm:-left-[13px]" />
        {challenge.icon && (
          <Image
            className="absolute w-4 h-4 sm:h-6 sm:w-5 bg-no-repeat bg-[20px_auto] top-[57%] sm:top-[50%] -left-[32px] sm:-left-[40px]"
            src={challenge.icon}
            alt={challenge.icon}
            width={24}
            height={20}
          />
        )}
      </div>
    </div>
  );
};

export { ChallengeExpandedCard };
