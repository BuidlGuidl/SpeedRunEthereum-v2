"use client";

import { useRef } from "react";
import { SubmitChallengeModal } from "./SubmitChallengeModal";
import { useAccount } from "wagmi";
import { useUser } from "~~/hooks/useUser";

export const SubmitChallengeButton = ({ challengeId }: { challengeId: string }) => {
  const submitChallengeModalRef = useRef<HTMLDialogElement>(null);
  const { address: connectedAddress } = useAccount();
  const { data: user, isLoading: isLoadingUser } = useUser(connectedAddress);

  const isDisabled = !user || isLoadingUser;
  if (isDisabled) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-8 inset-x-0 mx-auto w-fit">
        <button
          className="btn btn-sm sm:btn-md btn-primary text-secondary px-3 sm:px-4 mt-2 text-xs sm:text-sm"
          disabled={isDisabled}
          onClick={() => submitChallengeModalRef?.current?.showModal()}
        >
          Submit challenge
        </button>
      </div>
      <SubmitChallengeModal
        challengeId={challengeId}
        ref={submitChallengeModalRef}
        closeModal={() => submitChallengeModalRef.current?.close()}
      />
    </>
  );
};
