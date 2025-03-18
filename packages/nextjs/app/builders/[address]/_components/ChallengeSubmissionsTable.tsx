import Link from "next/link";
import { ChallengeStatus } from "./ChallengeStatus";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import { ReviewAction } from "~~/services/database/config/types";
import { UserChallengeSubmissions } from "~~/services/database/repositories/userChallengeSubmissions";

const SubmissionRow = ({ submission }: { submission: UserChallengeSubmissions[number] }) => {
  return (
    <tr key={submission.challengeId} className="hover py-4">
      <td className="py-6">
        <Link href={`/challenge/${submission.challengeId}`} className="hover:underline">
          🚩 Challenge {submission.challenge.sortOrder}: {submission.challenge.challengeName}
        </Link>
      </td>
      <td>
        {submission.contractUrl ? (
          <a href={submission.contractUrl} target="_blank" rel="noopener noreferrer" className="link">
            Code
          </a>
        ) : (
          "-"
        )}
      </td>
      <td>
        {submission.frontendUrl ? (
          <a href={submission.frontendUrl} target="_blank" rel="noopener noreferrer" className="link">
            Demo
          </a>
        ) : (
          "-"
        )}
      </td>
      <td>
        <DateWithTooltip timestamp={submission.submittedAt} />
      </td>
      <td>
        <ChallengeStatus
          reviewAction={submission.reviewAction ?? ReviewAction.SUBMITTED}
          comment={submission.reviewComment}
        />
      </td>
    </tr>
  );
};

export const ChallengeSubmissionsTable = ({ submissions }: { submissions: UserChallengeSubmissions }) => {
  const sortedSubmissions = submissions.sort((a, b) => a.challenge.sortOrder - b.challenge.sortOrder);

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
            {sortedSubmissions.map(submission => (
              <SubmissionRow key={submission.challengeId} submission={submission} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
