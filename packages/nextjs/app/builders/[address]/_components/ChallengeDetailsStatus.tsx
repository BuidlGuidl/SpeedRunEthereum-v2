import Link from "next/link";
import { ChallengeStatus } from "./ChallengeStatus";
import type { MappedChallenges } from "./GroupedChallenges";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import { ReviewAction } from "~~/services/database/config/types";

export function ChallengeDetailsStatus({ challenge }: { challenge: MappedChallenges }) {
  const isSubmitted = challenge.reviewAction === ReviewAction.SUBMITTED;
  const isAccepted = challenge.reviewAction === ReviewAction.ACCEPTED;
  const isRejected = challenge.reviewAction === ReviewAction.REJECTED;

  let badgeClass = "badge-warning";
  if (isAccepted) badgeClass = "badge-secondary";
  if (isRejected) badgeClass = "badge-error";

  let statusAlertClass = "bg-base-200";
  if (isAccepted) statusAlertClass = "bg-[#E3FFF1] dark:bg-base-200/70";
  if (isRejected) statusAlertClass = "bg-error/20 dark:bg-error/50";

  const shortedDescription = challenge.description.split(".")[0];

  return (
    <div>
      <div className="mt-3 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-base-300 rounded-full font-semibold text-sm dark:bg-base-200">
            {challenge.sortOrder}
          </div>
          <h2 className="m-0 font-medium">
            <Link href={`/challenge/${challenge.id}`} className="hover:underline">
              {challenge.challengeName}
            </Link>
          </h2>
        </div>
        <div className={`badge badge-sm py-3 px-3 ${badgeClass}`}>{challenge.reviewAction}</div>
      </div>
      <div className="pl-8">
        <p className="mt-2 mb-0 text-sm">{shortedDescription}.</p>
        <div className={`mt-3 flex items-center gap-2 px-2 py-1 rounded-md ${statusAlertClass}`}>
          <div>
            {isAccepted && "✅"}
            {isRejected && "❌"}
            {isSubmitted && "⏳"}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <DateWithTooltip timestamp={challenge.submittedAt || new Date()} />
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
}
