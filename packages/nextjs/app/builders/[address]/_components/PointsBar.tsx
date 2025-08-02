import Image from "next/image";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export function PointsBar({ points, totalPoints }: { points: number; totalPoints: number }) {
  return (
    <div className="relative mt-4 p-6 bg-base-100 border border-gray-200 rounded-lg overflow-hidden">
      <Image
        src="/assets/bgBanner_joinBatchClouds.svg"
        alt="bgBanner_joinBatchClouds"
        className="absolute scale-110 -left-4 bottom-[10%]"
        width={820}
        height={400}
      />
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
