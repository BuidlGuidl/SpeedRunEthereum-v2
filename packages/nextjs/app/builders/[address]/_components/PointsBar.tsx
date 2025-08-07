import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export function PointsBar({ points, totalPoints }: { points: number; totalPoints: number }) {
  return (
    <div className="mt-4 px-6 pb-5 pt-4 bg-base-100 border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-center gap-1.5 font-medium">
        <p className="m-0">
          {points} / {totalPoints}
        </p>
        &bull;
        <button className="flex items-center hover:underline hover:opacity-75">
          Buidl Points
          <QuestionMarkCircleIcon className="w-5 h-5 ml-1" />
        </button>
      </div>
      <div className="mt-2 flex justify-center">
        <progress className="progress progress-primary w-56 h-4" value={points} max={totalPoints}></progress>
      </div>
    </div>
  );
}
