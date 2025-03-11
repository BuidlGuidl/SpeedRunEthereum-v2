import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { DateWithTooltip } from "~~/app/_components/DateWithTooltip";
import { ReviewAction } from "~~/services/database/config/types";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";

const REVIEW_ACTION_BADGE_CLASSES: Record<ReviewAction, string> = {
  [ReviewAction.ACCEPTED]: "badge-success",
  [ReviewAction.REJECTED]: "badge-error",
  [ReviewAction.SUBMITTED]: "badge-warning",
} as const;

const ChallengeRow = ({ challenge }: { challenge: UserChallenges[number] }) => {
  const badgeClass = REVIEW_ACTION_BADGE_CLASSES[challenge.reviewAction];

  return (
    <tr key={challenge.challengeId} className="hover">
      <td>
        🚩 Challenge {challenge.challenge.sortOrder}: {challenge.challenge.challengeName}
      </td>
      <td>
        {challenge.contractUrl ? (
          <a href={challenge.contractUrl} target="_blank" rel="noopener noreferrer" className="link">
            Code
          </a>
        ) : (
          "-"
        )}
      </td>
      <td>
        {challenge.frontendUrl ? (
          <a href={challenge.frontendUrl} target="_blank" rel="noopener noreferrer" className="link">
            Demo
          </a>
        ) : (
          "-"
        )}
      </td>
      <td>
        <DateWithTooltip timestamp={challenge.submittedAt} />
      </td>
      <td>
        <span className={`badge ${badgeClass}`}>{challenge.reviewAction?.toLowerCase()}</span>
      </td>
      <td>
        {challenge.reviewComment && (
          <div className="tooltip" data-tip={challenge.reviewComment}>
            <QuestionMarkCircleIcon className="h-4 w-4 cursor-help" />
          </div>
        )}
      </td>
    </tr>
  );
};

export const UserChallengesTable = ({ challenges }: { challenges: UserChallenges }) => {
  return (
    <div className="flex flex-col gap-8 py-8 px-4 lg:px-8">
      <div>
        <h1 className="text-4xl font-bold mb-0">Challenges</h1>
      </div>
      <div className="w-full">
        <table className="table table-zebra bg-base-100 shadow-lg">
          <thead>
            <tr className="text-sm">
              <th>NAME</th>
              <th>CONTRACT</th>
              <th>LIVE DEMO</th>
              <th>UPDATED</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {challenges.map(challenge => (
              <ChallengeRow key={challenge.challengeId} challenge={challenge} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
