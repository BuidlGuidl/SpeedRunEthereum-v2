import { ChallengeIconComputer } from "./ChallengeGroupIcons";
import { ChallengeStatus } from "./ChallengeStatus";
import clsx from "clsx";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import { ReviewAction } from "~~/services/database/config/types";
import type { UserChallenges } from "~~/services/database/repositories/userChallenges";

export function UserChallenges({ challenges }: { challenges: UserChallenges }) {
  const sortedChallenges = challenges.sort((a, b) => a.challenge.sortOrder - b.challenge.sortOrder);

  return (
    <div>
      <div className="collapse collapse-arrow bg-base-300 rounded-lg">
        <input type="radio" name="challenge-accordion" defaultChecked />
        <div className="collapse-title text-xl font-medium">
          <div className="flex items-center gap-2">
            <ChallengeIconComputer />
            Blockchain 101
          </div>
        </div>
        <div className="collapse-content bg-base-100">
          <div className="mt-6 space-y-6 divide-y">
            {sortedChallenges.map(challenge => {
              const isSubmitted = challenge.reviewAction === ReviewAction.SUBMITTED;
              const isAccepted = challenge.reviewAction === ReviewAction.ACCEPTED;
              const isRejected = challenge.reviewAction === ReviewAction.REJECTED;

              return (
                <div key={challenge.id}>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-base-300 rounded-full font-semibold dark:bg-base-200">
                        {challenge.challenge.sortOrder}
                      </div>
                      <h2 className="m-0 font-medium">{challenge.challenge.challengeName}</h2>
                    </div>
                    <div
                      className={clsx("badge text-xs", {
                        "badge-info": isAccepted,
                        "badge-warning": isSubmitted,
                        "badge-error": isRejected,
                      })}
                    >
                      {challenge.reviewAction}
                    </div>
                  </div>
                  <div className="pl-10">
                    <p>{challenge.challenge.description}</p>
                    <div className="mt-6 flex items-center gap-2 px-3 py-2 bg-base-200 rounded-lg">
                      <div className="text-sm">
                        {isAccepted && "✅"}
                        {isRejected && "❌"}
                        {isSubmitted && "⏳"}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <DateWithTooltip timestamp={challenge.submittedAt} />
                        {challenge.contractUrl && (
                          <a href={challenge.contractUrl} target="_blank" rel="noopener noreferrer" className="link">
                            Code
                          </a>
                        )}
                        {challenge.frontendUrl && (
                          <a href={challenge.frontendUrl} target="_blank" rel="noopener noreferrer" className="link">
                            Demo
                          </a>
                        )}
                        <ChallengeStatus comment={challenge.reviewComment} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-6 collapse collapse-arrow bg-base-300 rounded-lg">
        <input type="radio" name="challenge-accordion" />
        <div className="collapse-title text-xl font-medium">Advanced Challenges</div>
        <div className="collapse-content bg-base-100">
          <p>hello</p>
        </div>
      </div>
    </div>
  );
}
