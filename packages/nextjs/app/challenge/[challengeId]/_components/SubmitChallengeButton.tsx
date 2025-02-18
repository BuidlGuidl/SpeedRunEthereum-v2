"use client";

import { useRef } from "react";
import { SubmitChallengeModal } from "./SubmitChallengeModal";
import { useAccount } from "wagmi";
import { useUser } from "~~/hooks/useUser";

export const SubmitChallengeButton = ({ challengeId }: { challengeId: string }) => {
  const submitChallengeModalRef = useRef<HTMLDialogElement>(null);
  const { address: connectedAddress } = useAccount();

  const { data: user, isLoading: isLoadingUser } = useUser(connectedAddress);
  return (
    <>
      <button
        className="btn btn-primary mt-2"
        disabled={!user || isLoadingUser}
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
