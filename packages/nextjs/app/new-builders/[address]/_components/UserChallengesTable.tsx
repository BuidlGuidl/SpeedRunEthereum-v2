import Link from "next/link";
import { ChallengeStatus } from "./ChallengeStatus";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import { ReviewAction } from "~~/services/database/config/types";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";

const ChallengeRow = ({ challenge }: { challenge: UserChallenges[number] }) => {
  const isDisabled = challenge.challenge.disabled;

  return (
    <tr key={challenge.challengeId} className={`hover py-4 ${isDisabled ? "opacity-60" : ""}`}>
      <td className="py-6">
        {isDisabled ? (
          <span>{challenge.challenge.challengeName}</span>
        ) : (
          <Link href={`/challenge/${challenge.challengeId}`} className="hover:underline">
            🚩 Challenge {challenge.challenge.sortOrder}: {challenge.challenge.challengeName}
          </Link>
        )}
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
        <ChallengeStatus
          reviewAction={challenge.reviewAction ?? ReviewAction.SUBMITTED}
          comment={challenge.reviewComment}
        />
      </td>
    </tr>
  );
};

export const UserChallengesTable = ({ challenges }: { challenges: UserChallenges }) => {
  const sortedChallenges = challenges.sort((a, b) => a.challenge.sortOrder - b.challenge.sortOrder);

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-x-auto md:overflow-x-visible">
        <table className="table bg-base-100 shadow-lg min-w-full overflow-hidden">
          <thead>
            <tr className="text-sm">
              <th>NAME</th>
              <th>CONTRACT</th>
              <th>LIVE DEMO</th>
              <th>UPDATED</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {sortedChallenges.map(challenge => (
              <ChallengeRow key={challenge.challengeId} challenge={challenge} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
