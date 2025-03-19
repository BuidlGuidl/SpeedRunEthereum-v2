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
        className="btn btn-sm sm:btn-md btn-primary text-secondary px-3 sm:px-4 mt-2 fixed bottom-8 inset-x-0 mx-auto w-fit text-xs sm:text-sm"
        disabled={!user || isLoadingUser}
        onClick={() => submitChallengeModalRef && submitChallengeModalRef.current?.showModal()}
      >
        Submit challenge
      </button>
      <SubmitChallengeModal
        challengeId={challengeId}
        ref={submitChallengeModalRef}
        closeModal={() => submitChallengeModalRef.current?.close()}
      />
    </>
  );
};
