import type { MappedChallenges } from "./GroupedChallenges";

export function ChallengeDetails({ challenge }: { challenge: MappedChallenges }) {
  return (
    <div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-base-300 rounded-full font-semibold dark:bg-base-200">
            {challenge.sortOrder}
          </div>
          <h2 className="m-0 font-medium">{challenge.challengeName}</h2>
        </div>
      </div>
      <div className="pl-10">
        <p>{challenge.description}</p>
      </div>
    </div>
  );
}
