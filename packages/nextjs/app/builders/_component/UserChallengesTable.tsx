import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";

export const UserChallengesTable = ({ challenges }: { challenges: UserChallenges }) => {
  return (
    <div className="flex flex-col gap-8 py-8 px-4 lg:px-8">
      <div>
        <h1 className="text-4xl font-bold mb-0">Challenges</h1>
      </div>
      <div className="w-full">
        <table className="table table-zebra bg-base-100">
          <thead>
            <tr className="text-sm">
              <th className="bg-primary">NAME</th>
              <th className="bg-primary">CONTRACT</th>
              <th className="bg-primary">LIVE DEMO</th>
              <th className="bg-primary">SUBMITED AT</th>
              <th className="bg-primary">STATUS</th>
              <th className="bg-primary"></th>
            </tr>
          </thead>
          <tbody>
            {challenges.map(challenge => (
              <tr key={challenge.userChallengeId} className="hover">
                <td>🏃‍♂️ Challenge {challenge.challengeCode}</td>
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
                <td>{challenge.submittedTimestamp ? challenge.submittedTimestamp.toLocaleString() : "-"}</td>
                <td>
                  <span
                    className={`badge ${
                      challenge.reviewAction === "ACCEPTED"
                        ? "badge-success"
                        : challenge.reviewAction === "REJECTED"
                          ? "badge-error"
                          : "badge-warning"
                    }`}
                  >
                    {challenge.reviewAction?.toLowerCase() || "pending"}
                  </span>
                </td>
                <td>
                  {challenge.reviewComment && (
                    <div className="tooltip" data-tip={challenge.reviewComment}>
                      <QuestionMarkCircleIcon className="h-4 w-4 cursor-help" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
