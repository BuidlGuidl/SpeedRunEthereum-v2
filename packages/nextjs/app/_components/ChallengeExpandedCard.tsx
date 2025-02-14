import React from "react";
import Image from "next/image";
import CrossedSwordsIcon from "../_assets/icons/CrossedSwordsIcon";
import PadLockIcon from "../_assets/icons/PadLockIcon";
import QuestionIcon from "../_assets/icons/QuestionIcon";
import { User } from "../_types/User";
import JoinBG from "./JoinBG";
import { CHALLENGE_SUBMISSION_STATUS } from "~~/constants";

interface Challenge {
  label: string;
  description: string;
  dependencies?: string[];
  disabled?: boolean;
  lockedTimestamp?: number;
  checkpoint?: boolean;
  icon?: string;
  previewImage?: string;
  externalLink?: {
    link?: string;
    claim: string;
  };
}

interface ChallengeAttempt {
  status: string;
  submittedTimestamp: number;
}

interface ChallengeExpandedCardProps {
  challengeId: string;
  challenge: Challenge;
  connectedBuilder: User;
  builderAttemptedChallenges: Record<string, ChallengeAttempt>;
  userProvider: any; // Replace with proper type
  isFirst?: boolean;
  isLast?: boolean;
  challengeIndex: number;
}

const ChallengeExpandedCard: React.FC<ChallengeExpandedCardProps> = ({
  challengeId,
  challenge,
  connectedBuilder,
  builderAttemptedChallenges,
  userProvider,
  isFirst = false,
  isLast = false,
  challengeIndex,
}) => {
  const builderHasCompletedDependenciesChallenges = challenge.dependencies?.every(id => {
    if (!builderAttemptedChallenges[id]) {
      return false;
    }
    if (!(builderAttemptedChallenges[id].status === CHALLENGE_SUBMISSION_STATUS.ACCEPTED)) {
      return false;
    }
    if (challenge.lockedTimestamp) {
      return (
        new Date().getTime() - builderAttemptedChallenges[id].submittedTimestamp > challenge.lockedTimestamp * 60 * 1000
      );
    }

    return true;
  });

  const pendingDependenciesChallenges = challenge.dependencies?.filter(dependency => {
    return (
      !builderAttemptedChallenges[dependency] ||
      builderAttemptedChallenges[dependency].status !== CHALLENGE_SUBMISSION_STATUS.ACCEPTED
    );
  });

  const lockReasonToolTip = "The following challenges are not completed: " + pendingDependenciesChallenges?.join(", ");

  const challengeStatus = builderAttemptedChallenges[challengeId]?.status;

  let colorScheme;
  let label;
  switch (challengeStatus) {
    case CHALLENGE_SUBMISSION_STATUS.ACCEPTED: {
      colorScheme = "green";
      label = "Accepted";
      break;
    }
    case CHALLENGE_SUBMISSION_STATUS.REJECTED: {
      colorScheme = "red";
      label = "Rejected";
      break;
    }
    case CHALLENGE_SUBMISSION_STATUS.SUBMITTED: {
      label = "Submitted";
      break;
    }
    default:
    // do nothing
  }

  const isChallengeLocked = challenge.disabled || !builderHasCompletedDependenciesChallenges;

  // if (challenge.checkpoint) {
  //   return (
  //     <div className="flex justify-center bg-sre-bgBannerBackground bg-[url(/assets/bgBanner_castlePlatform.svg)] bg-bottom bg-repeat-x bg-[length:150%_auto] lg:bg-auto relative overflow-hidden">
  //       <Image src="/assets/bgBanner_joinBgClouds.svg" alt="bgBanner_joinBgClouds" width={820} height={400} />
  //       <div className="max-w-7xl py-8 mx-14 pl-10 border-l-5 border-solid relative space-y-16 lg:space-y-32 min-h-[md] lg:min-h-[lg]">
  //         <div className="flex justify-center relative mt-2 lg:mt-8">
  //           <Image src="/assets/bgBanner_JoinBG.svg" width={820} height={400} alt="bgBanner_JoinBG" />
  //         </div>
  //         <div className="flex flex-col lg:flex-row justify-between">
  //           <p className="mb-4 text-sre-text text-center lg:text-left lg:max-w-[35%]">{challenge.description}</p>
  //           <div className="flex items-center self-end">
  //             {builderHasCompletedDependenciesChallenges ? (
  //               <JoinBG
  //                 text={challenge.externalLink?.claim ?? ""}
  //                 isChallengeLocked={isChallengeLocked}
  //                 userProvider={userProvider}
  //                 connectedBuilder={connectedBuilder}
  //               />
  //             ) : (
  //               <button
  //                 className="flex justify-center items-center text-xl lg:text-lg px-2 py-1 border-2 border-primary rounded-full disabled:opacity-50"
  //                 disabled={true}
  //               >
  //                 <PadLockIcon className="w-6 h-6" />
  //                 <span className="ml-2 uppercase font-medium">Locked</span>
  //               </button>
  //             )}

  //             {!builderHasCompletedDependenciesChallenges && (
  //               <div className="group relative cursor-pointer">
  //                 <QuestionIcon className="h-8 w-8 [&>path]:fill-sre-default" />
  //                 <span className="invisible group-hover:visible absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg">
  //                   {lockReasonToolTip}
  //                 </span>
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //         <span className="absolute h-5 w-5 rounded-full bg-current border-4 top-[22%] lg:top-[30%] -left-[13px]" />
  //         {challenge.icon && (
  //           <span
  //             className="absolute h-5 w-5 bg-no-repeat bg-[length:20px_auto] top-[22%] lg:top-[30%] -left-[40px]"
  //             style={{ backgroundImage: challenge.icon }}
  //           />
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex justify-center">
      <div
        className={`flex max-w-7xl py-8 mx-14 pl-10 border-primary border-l-[5px] relative flex-col-reverse lg:flex-row 
        ${!isLast ? "border-b-2" : ""}`}
      >
        {isFirst && <div className="absolute -left-3 z-10 top-0 w-[18px] h-[58%] lg:h-[50%] bg-base-200" />}
        {/* {isLast && (
          <div className="absolute -left-3 z-10 bottom-0 w-[18px] h-[calc(58%-20px)] lg:h-[calc(50%-20px)] bg-base-200" />
        )} */}
        <div className="flex flex-col max-w-full lg:max-w-[40%] gap-18 lg:gap-20">
          <div className="flex flex-col items-start gap-0">
            {challengeStatus && (
              <span
                className={`rounded-xl py-0.5 px-2.5 text-sm ${
                  colorScheme === "green"
                    ? "bg-base-300 text-base-content"
                    : colorScheme === "red"
                      ? "bg-red-400 text-white"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {label}
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
                      <span className="text-sre-text ml-2 uppercase">Locked</span>
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
                      <span className="text-sre-text ml-2 uppercase font-medium">Quest</span>
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
