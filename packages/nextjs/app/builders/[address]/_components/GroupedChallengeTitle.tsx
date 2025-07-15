import type { MappedChallenges } from "./GroupedChallenges";
import { ReviewAction } from "~~/services/database/config/types";

export function GroupedChallengeTitle({
  title,
  icon,
  challenges,
}: {
  title: string;
  icon: React.ReactNode;
  challenges: MappedChallenges[];
}) {
  const completed = challenges.filter(challenge => challenge.reviewAction === ReviewAction.ACCEPTED).length;
  const total = challenges.length;
  const progress = (completed / total) * 100;

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <div className="flex items-center gap-2">
        {icon}
        {title}
      </div>
      <div className="flex items-center gap-3 lg:ml-4">
        <p className="m-0 text-xs">
          {completed} / {total} completed
        </p>
        <progress className="progress progress-info w-40" value={progress} max="100"></progress>
      </div>
    </div>
  );
}
