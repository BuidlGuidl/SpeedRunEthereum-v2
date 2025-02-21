import Image from "next/image";
import Link from "next/link";
import CrossedSwordsIcon from "../_assets/icons/CrossedSwordsIcon";
import PadLockIcon from "../_assets/icons/PadLockIcon";
import QuestionIcon from "../_assets/icons/QuestionIcon";
import { ChallengeData, challengesData } from "../_data/_hardcoded";
import { getChallengeDependenciesInfo } from "./utils";
import { ReviewAction } from "~~/services/database/config/types";
import { getChallengeById } from "~~/services/database/repositories/challenges";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";

type ChallengeExpandedCardProps = {
  challengeId: string;
  userChallenges: UserChallenges;
};

const ChallengeExpandedCard: React.FC<ChallengeExpandedCardProps> = async ({ challengeId, userChallenges }) => {
  const fetchedChallenge = await getChallengeById(challengeId);

  const userChallenge = userChallenges.find(userChallenge => userChallenge.challengeId === challengeId);
  if (!fetchedChallenge) {
    return null;
  }

  const additionalChallengeData = challengesData.find(c => c.id === challengeId);
  // Define a merged type for better type safety
  type FullChallenge = typeof fetchedChallenge & ChallengeData;
  const challenge = { ...fetchedChallenge, ...additionalChallengeData } as FullChallenge;

  const { sortOrder } = challenge;
  const { completed: builderHasCompletedDependenciesChallenges, lockReasonToolTip } = getChallengeDependenciesInfo({
    dependencies: challenge.dependencies || [],
    userChallenges,
  });

  const reviewAction = userChallenge?.reviewAction;
  const isChallengeLocked = challenge.disabled || !builderHasCompletedDependenciesChallenges;

  return (
    <div className="challenge-expanded-card flex justify-center group relative  ">
      <div className="flex justify-between max-w-7xl py-8 mx-14 pl-10 lg:pr-12 border-primary border-l-[5px] relative flex-col-reverse lg:flex-row border-b-2 group-[:not(:has(+.challenge-expanded-card))]:border-b-0">
        <div className="hidden group-first:block absolute -left-3 z-10 top-0 w-[18px] h-[58%] lg:h-[50%] bg-base-200" />
        <div className="flex flex-col max-w-full lg:max-w-[40%] gap-18 lg:gap-20">
          <div className="flex flex-col items-start gap-0">
            {reviewAction && (
              <span
                className={`rounded-xl py-0.5 px-2.5 text-sm capitalize ${
                  reviewAction === ReviewAction.ACCEPTED
                    ? "bg-base-300 text-base-content"
                    : reviewAction === ReviewAction.REJECTED
                      ? "bg-red-400 text-white"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {reviewAction.toLowerCase()}
              </span>
            )}

            <span className="text-xl lg:text-lg">Challenge #{sortOrder}</span>
            <h2 className="text-3xl lg:text-2xl font-bold mt-0">
              {challenge.label.split(": ")[1] ? challenge.label.split(": ")[1] : challenge.label}
            </h2>
          </div>
          <div className="flex flex-col gap-8">
            <span className="text-lg lg:text-md">{challenge.description}</span>
            {challenge.externalLink?.link ? (
              // Redirect to externalLink if set (instead of challenge detail view)
              <div className="flex items-center">
                <button
                  className={`flex items-center text-xl lg:text-lg px-4 py-1 border-2 border-primary rounded-full bg-base-300 ${
                    isChallengeLocked ? "opacity-50" : ""
                  }`}
                  disabled={isChallengeLocked}
                >
                  {builderHasCompletedDependenciesChallenges ? (
                    <span>{challenge.externalLink.claim}</span>
                  ) : (
                    <div className="flex items-center">
                      <PadLockIcon className="w-6 h-6" />
                      <span className="ml-2 uppercase">Locked</span>
                    </div>
                  )}
                </button>
                {!builderHasCompletedDependenciesChallenges && (
                  <div className="tooltip relative cursor-pointer ml-2" data-tip={lockReasonToolTip}>
                    <QuestionIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                {isChallengeLocked ? (
                  <button
                    disabled
                    className="flex items-center text-xl lg:text-lg px-4 py-1 border-2 border-primary rounded-full bg-base-300 opacity-50 cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <PadLockIcon className="w-6 h-6" />
                      <span className="ml-2 uppercase font-medium">Locked</span>
                    </div>
                  </button>
                ) : (
                  <Link
                    href={`/challenge/${challengeId}`}
                    className="flex items-center text-xl lg:text-lg px-4 py-1 border-2 border-primary rounded-full bg-base-300 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <CrossedSwordsIcon className="w-6 h-6" />
                      <span className="ml-2 uppercase font-medium">Quest</span>
                    </div>
                  </Link>
                )}
                {!builderHasCompletedDependenciesChallenges && (
                  <div className="tooltip relative cursor-pointer ml-2" data-tip={lockReasonToolTip}>
                    <QuestionIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center mb-6 lg:mb-0">
          {challenge.previewImage ? (
            <Image
              src={challenge.previewImage}
              alt={challenge.label}
              // workaround to avoid console warnings
              className="w-full max-w-[490px] h-auto"
              width={0}
              height={0}
            />
          ) : (
            <p className="p-3 text-center">{challengeId} image</p>
          )}
        </div>
        <span className="absolute h-5 w-5 rounded-full bg-base-300 border-primary border-4 top-[58%] lg:top-[50%] -left-[13px]" />
        {challenge.icon && (
          <Image
            className="absolute h-6 w-5 bg-no-repeat bg-[20px_auto] top-[58%] lg:top-[50%] -left-[40px]"
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
