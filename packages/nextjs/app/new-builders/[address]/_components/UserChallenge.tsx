"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChallengeModal } from "./ChallengeModal";
import clsx from "clsx";

type Challenge = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

export function UserChallenge({ challenge }: { challenge: Challenge }) {
  const challengeModalRef = useRef<HTMLDialogElement>(null);

  return (
    <div
      key={challenge.id}
      className={clsx({
        "opacity-50": !challenge.completed,
      })}
    >
      <button
        onClick={() => challengeModalRef.current?.showModal()}
        className={clsx(
          "w-full h-auto aspect-square flex items-center justify-center bg-base-300 mask mask-hexagon-2 transition-transform hover:scale-110 dark:bg-base-200/50",
        )}
      >
        <Image
          src={`/assets/achievements/trophy-${challenge.id}.svg`}
          alt={`Trophy for ${challenge.id}`}
          className="w-16 h-auto"
          width={100}
          height={100}
        />
      </button>
      <p className="m-0 text-sm text-center text-gray-400 dark:text-gray-200">Challenge #{challenge.id}</p>
      <p className="mt-0.5 mb-0 text-sm text-center font-medium">{challenge.title}</p>
      <ChallengeModal id={challenge.id} ref={challengeModalRef} closeModal={() => challengeModalRef.current?.close()} />
    </div>
  );
}
