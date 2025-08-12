"use client";

import { forwardRef, useRef } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

type PointsBarModalProps = {
  closeModal: () => void;
};

const stats = [
  { name: "Each Completed Challenge", stat: "+10 XP" },
  { name: "Completed a Batch", stat: "+20 XP" },
  { name: "First Build Submitted", stat: "+5 XP" },
];

const PointsBarModal = forwardRef<HTMLDialogElement, PointsBarModalProps>(({ closeModal }, ref) => {
  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box max-w-4xl w-[95%]">
        <form method="dialog" className="bg-secondary -mx-6 -mt-6 px-6 py-4 flex items-center justify-between">
          <div className="flex justify-between items-center">
            <p className="font-bold text-xl m-0">How XP is Calculated</p>
          </div>
          <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost text-xl h-auto">
            ✕
          </button>
        </form>

        <div>
          <dl className="mt-5 grid grid-cols-1 divide-gray-200 overflow-hidden rounded-lg bg-base-100 border border-gray-200 md:grid-cols-3 md:divide-x md:divide-y-0">
            {stats.map(item => (
              <div key={item.name} className="px-4 py-5 sm:p-6">
                <dt className="text-base font-normal text-gray-500">{item.name}</dt>
                <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                  <div className="flex items-baseline text-2xl font-semibold text-primary">{item.stat}</div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>close</button>
      </form>
    </dialog>
  );
});

PointsBarModal.displayName = "PointsBarModal";

export function PointsBar({ points, totalPoints }: { points: number; totalPoints: number }) {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="mt-4 px-6 pb-5 pt-4 bg-base-100 border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-center gap-1.5 font-medium">
        <p className="m-0 font-light">
          {points} / {totalPoints}
        </p>
        <button
          className="flex items-center hover:underline hover:opacity-75"
          onClick={() => modalRef.current?.showModal()}
        >
          <span className="font-bold">XP</span>
          <QuestionMarkCircleIcon className="w-5 h-5 ml-1" />
        </button>
      </div>
      <div className="mt-2 flex justify-center">
        <progress className="progress progress-primary w-56 h-4" value={points} max={totalPoints}></progress>
      </div>
      <PointsBarModal ref={modalRef} closeModal={() => modalRef.current?.close()} />
    </div>
  );
}
