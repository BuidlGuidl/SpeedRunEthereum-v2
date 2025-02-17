"use client";

import { useRef } from "react";
import { SubmitChallengeModal } from "./SubmitChallengeModal";

export const SubmitChallengeClient = ({ challengeId }: { challengeId: string }) => {
  const submitChallengeModalRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        className="btn btn-primary mt-2"
        onClick={() => submitChallengeModalRef && submitChallengeModalRef.current?.showModal()}
      >
        Submit
      </button>
      <SubmitChallengeModal
        challengeId={challengeId}
        ref={submitChallengeModalRef}
        closeModal={() => submitChallengeModalRef.current?.close()}
      />
    </>
  );
};
