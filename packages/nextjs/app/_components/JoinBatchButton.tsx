"use client";

import Link from "next/link";
import PadLockIcon from "../_assets/icons/PadLockIcon";
import QuestionIcon from "../_assets/icons/QuestionIcon";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useJoinBatch } from "~~/hooks/useJoinBatch";
import { useUser } from "~~/hooks/useUser";
import { Batch } from "~~/services/database/repositories/batches";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";
import { JOIN_BATCH_DEPENDENCIES, getChallengeDependenciesInfo } from "~~/utils/dependent-challenges";

const NO_BATCH_LOCK_REASON = "No batch is currently open";
const NO_USER_LOCK_REASON = "Register and complete the challenges to join a batch";

type JoinBatchButtonProps = {
  userChallenges?: UserChallenges;
  latestOpenBatch?: Batch;
  isLoadingLatestOpenBatch?: boolean;
};

const JoinBatchButton = ({ userChallenges = [], latestOpenBatch, isLoadingLatestOpenBatch }: JoinBatchButtonProps) => {
  const { address: connectedAddress } = useAccount();
  const { data: user } = useUser(connectedAddress);
  const { handleJoinBatch, isJoiningBatch } = useJoinBatch({ user });

  const userJoinedCurrentBatch = user && user.batchId && user.batchId === latestOpenBatch?.id;
  const userJoinedOtherBatch = user && user.batchId && user.batchId !== latestOpenBatch?.id;

  const { openConnectModal } = useConnectModal();
  const { completed: dependenciesCompleted, lockReasonTooltip: dependenciesLockReason } = getChallengeDependenciesInfo({
    dependencies: JOIN_BATCH_DEPENDENCIES,
    userChallenges,
  });

  if (!connectedAddress) {
    return (
      <button
        onClick={openConnectModal}
        className="flex justify-center text-black bg-violet-light items-center text-xs sm:text-lg px-4 py-1 border-2 border-violet rounded-full hover:bg-opacity-80"
      >
        <span>Connect Wallet</span>
      </button>
    );
  }

  if (isLoadingLatestOpenBatch) {
    return (
      <button
        disabled
        className="flex justify-center text-violet bg-violet-light items-center text-sm sm:text-lg px-4 py-1 border-2 border-violet rounded-full hover:bg-opacity-80 disabled:opacity-70 disabled:hover:bg-opacity-100"
      >
        <span>Loading...</span>
      </button>
    );
  }

  if (!user || !dependenciesCompleted || !latestOpenBatch) {
    let lockReason;

    if (!user) {
      lockReason = NO_USER_LOCK_REASON;
    } else if (!latestOpenBatch) {
      lockReason = NO_BATCH_LOCK_REASON;
    } else if (!dependenciesCompleted) {
      lockReason = dependenciesLockReason;
    }

    return (
      <>
        <button
          disabled
          className={`flex justify-center text-violet bg-violet-light items-center text-sm sm:text-lg px-4 py-1 border-2 border-violet rounded-full hover:bg-opacity-80 disabled:opacity-70 disabled:hover:bg-opacity-100 ${lockReason ? "cursor-not-allowed hover:bg-violet-light" : ""}`}
          onClick={() => handleJoinBatch()}
        >
          <PadLockIcon className="w-4 h-4 sm:w-6 sm:h-6 mr-2" fill="#606CCF" />
          <span className="uppercase">Locked</span>
        </button>

        <div className="tooltip tooltip-violet tooltip-left relative cursor-pointer ml-2 " data-tip={lockReason}>
          <QuestionIcon className="w-5 h-5 sm:h-8 sm:w-8 text-violet" />
        </div>
      </>
    );
  }

  if (userJoinedOtherBatch) {
    return (
      <button
        disabled
        className="flex justify-center text-violet bg-violet-light items-center text-sm sm:text-lg px-4 py-1 border-2 border-violet rounded-full hover:bg-opacity-80 disabled:opacity-70 disabled:hover:bg-opacity-100"
      >
        <span>Already joined</span>
      </button>
    );
  }

  if (userJoinedCurrentBatch) {
    return (
      <Link
        href={latestOpenBatch.telegramLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex justify-center text-black bg-violet-light items-center text-sm sm:text-lg px-4 py-1 border-2 border-violet rounded-full hover:bg-opacity-80 disabled:opacity-70 disabled:hover:bg-opacity-100"
      >
        Join Telegram
      </Link>
    );
  }

  // user is not joined any batch yet, and dependencies are completed
  return (
    <button
      className={`flex justify-center text-black bg-violet-light items-center text-sm sm:text-lg px-4 py-1 border-2 border-violet rounded-full hover:bg-opacity-80 disabled:opacity-70 disabled:hover:bg-opacity-100 disabled:cursor-not-allowed`}
      onClick={() => handleJoinBatch()}
      disabled={isJoiningBatch}
    >
      {isJoiningBatch ? <span className="loading loading-spinner loading-sm"></span> : <span>Get Telegram Access</span>}
    </button>
  );
};

export default JoinBatchButton;
