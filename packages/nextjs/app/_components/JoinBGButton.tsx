"use client";

import React from "react";
import PadLockIcon from "../_assets/icons/PadLockIcon";
import QuestionIcon from "../_assets/icons/QuestionIcon";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useJoinBg } from "~~/hooks/useJoinBg";
import { UserRole } from "~~/services/database/config/types";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";
import { UserByAddress } from "~~/services/database/repositories/users";
import { JOIN_BG_DEPENDENCIES, getChallengeDependenciesInfo } from "~~/utils/dependent-challenges";

type JoinBGProps = {
  user?: UserByAddress;
  userChallenges?: UserChallenges;
};

const JoinBGButton = ({ user, userChallenges = [] }: JoinBGProps) => {
  const { address: connectedAddress } = useAccount();
  const { handleJoinBg, isJoiningBg } = useJoinBg({ user });
  const { openConnectModal } = useConnectModal();
  const { completed: dependenciesCompleted, lockReasonToolTip } = getChallengeDependenciesInfo({
    dependencies: JOIN_BG_DEPENDENCIES,
    userChallenges,
  });

  const builderAlreadyJoined = Boolean(user?.role === UserRole.BUILDER || user?.role === UserRole.ADMIN);

  if (!connectedAddress) {
    return (
      <button
        onClick={openConnectModal}
        className="flex justify-center text-[#088484] bg-[#C8F5FF] items-center text-xs sm:text-lg px-4 py-1 border-2 border-[#088484] rounded-full opacity-70"
      >
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <>
      <button
        disabled={!dependenciesCompleted || builderAlreadyJoined}
        className={`flex justify-center text-[#088484] bg-[#C8F5FF] items-center text-xs sm:text-lg px-4 py-1 border-2 border-[#088484] rounded-full disabled:opacity-70 ${!dependenciesCompleted ? "cursor-not-allowed" : ""}`}
        onClick={handleJoinBg}
      >
        {!dependenciesCompleted && (
          <>
            <PadLockIcon className="w-4 h-4 sm:w-6 sm:h-6 mr-2" />
            <span className="uppercase text-xs sm:text-lg">Locked</span>
          </>
        )}
        {dependenciesCompleted && !isJoiningBg && !builderAlreadyJoined && <span>Join the 🏰️ BuidlGuidl</span>}
        {isJoiningBg && <span className="mr-2">Joining...</span>}
        {builderAlreadyJoined && <span>Already joined</span>}
      </button>
      {!dependenciesCompleted && (
        <div className="tooltip tooltip-left relative cursor-pointer ml-2 text-[#088484]" data-tip={lockReasonToolTip}>
          <QuestionIcon className="w-5 h-5 sm:h-8 sm:w-8" />
        </div>
      )}
    </>
  );
};

export default JoinBGButton;
