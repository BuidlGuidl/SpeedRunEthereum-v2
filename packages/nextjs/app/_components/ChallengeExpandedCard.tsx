import React from "react";
import Image from "next/image";
import CrossedSwordsIcon from "../_assets/icons/CrossedSwordsIcon";
import PadLockIcon from "../_assets/icons/PadLockIcon";
import QuestionIcon from "../_assets/icons/QuestionIcon";
import { Challenge, ChallengeAttempt } from "../_types/User";
import { getChallengeDependenciesInfo } from "./utils";
import { CHALLENGE_SUBMISSION_STATUS } from "~~/constants";

const challengeLabels: Record<keyof typeof CHALLENGE_SUBMISSION_STATUS, { label: string }> = {
  [CHALLENGE_SUBMISSION_STATUS.ACCEPTED]: { label: "Accepted" },
  [CHALLENGE_SUBMISSION_STATUS.REJECTED]: { label: "Rejected" },
  [CHALLENGE_SUBMISSION_STATUS.SUBMITTED]: { label: "Submitted" },
};

interface ChallengeExpandedCardProps {
  challengeId: string;
  challenge: Challenge;
  builderAttemptedChallenges: Record<string, ChallengeAttempt>;
  isFirst?: boolean;
  isLast?: boolean;
  challengeIndex: number;
}

const ChallengeExpandedCard: React.FC<ChallengeExpandedCardProps> = ({
  challengeId,
  challenge,
  builderAttemptedChallenges,
  isFirst = false,
  isLast = false,
  challengeIndex,
}) => {
  const { completed: builderHasCompletedDependenciesChallenges, lockReasonToolTip } = getChallengeDependenciesInfo({
    dependencies: challenge.dependencies || [],
    builderAttemptedChallenges,
  });

  const challengeStatus = builderAttemptedChallenges[challengeId]?.status;
  const isChallengeLocked = challenge.disabled || !builderHasCompletedDependenciesChallenges;

  return (
    <div className="flex justify-center">
      <div
        className={`flex justify-between max-w-7xl py-8 mx-14 pl-10 lg:pr-12 border-primary border-l-[5px] relative flex-col-reverse lg:flex-row ${!isLast ? "border-b-2" : ""}`}
      >
        {isFirst && <div className="absolute -left-3 z-10 top-0 w-[18px] h-[58%] lg:h-[50%] bg-base-200" />}
        <div className="flex flex-col max-w-full lg:max-w-[40%] gap-18 lg:gap-20">
          <div className="flex flex-col items-start gap-0">
            {challengeStatus && (
              <span
                className={`rounded-xl py-0.5 px-2.5 text-sm ${
                  challengeStatus === CHALLENGE_SUBMISSION_STATUS.ACCEPTED
                    ? "bg-base-300 text-base-content"
                    : challengeStatus === CHALLENGE_SUBMISSION_STATUS.REJECTED
                      ? "bg-red-400 text-white"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {challengeLabels[challengeStatus].label}
              </span>
            )}

            <span className="text-xl lg:text-lg">Challenge #{challengeIndex}</span>
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
                  <div className="group relative cursor-pointer ml-2">
                    <QuestionIcon className="h-8 w-8" />
                    <span className="invisible group-hover:visible absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg">
                      {lockReasonToolTip}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  className={`flex items-center text-xl lg:text-lg px-4 py-1 border-2 border-primary rounded-full bg-base-300 ${
                    isChallengeLocked ? "opacity-50" : ""
                  }`}
                  disabled={isChallengeLocked}
                >
                  {!isChallengeLocked ? (
                    <div className="flex items-center">
                      <CrossedSwordsIcon className="w-6 h-6" />
                      <span className="ml-2 uppercase font-medium">Quest</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <PadLockIcon className="w-6 h-6" />
                      <span className="ml-2 uppercase font-medium">Locked</span>
                    </div>
                  )}
                </button>
                {!builderHasCompletedDependenciesChallenges && (
                  <div className="group relative cursor-pointer ml-2">
                    <QuestionIcon className="h-8 w-8" />
                    <span className="invisible group-hover:visible absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg">
                      {lockReasonToolTip}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center mb-6 lg:mb-0">
          {challenge.previewImage ? (
            <Image src={challenge.previewImage} alt={challenge.label} width={490} height={490} />
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
