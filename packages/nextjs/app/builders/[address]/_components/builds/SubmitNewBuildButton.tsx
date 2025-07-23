"use client";

import { useRef } from "react";
import { BuildFormModal } from "./BuildFormModal";
import { PlusIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useSubmitBuild } from "~~/hooks/useSubmitBuild";

export const SubmitNewBuildButton = ({
  isProfileOwner,
  userHasCompletedChallenges,
}: {
  isProfileOwner: boolean;
  userHasCompletedChallenges: boolean;
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const { submitBuild, isPending } = useSubmitBuild({
    onSuccess: () => {
      modalRef.current?.close();
    },
  });

  if (!isProfileOwner) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        {!userHasCompletedChallenges && (
          <div className="tooltip" data-tip="Please try to complete a challenge before submitting a build">
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </div>
        )}
        <button
          className="btn btn-primary btn-sm disabled:text-base-content/50"
          disabled={!userHasCompletedChallenges}
          onClick={() => modalRef.current?.showModal()}
        >
          <PlusIcon className="w-4 h-4" />
          New Build
        </button>
      </div>
      <BuildFormModal
        ref={modalRef}
        closeModal={() => modalRef.current?.close()}
        buttonAction={submitBuild}
        buttonText="Submit"
        isPending={isPending}
      />
    </div>
  );
};
