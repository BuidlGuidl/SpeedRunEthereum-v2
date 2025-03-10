"use client";

import React from "react";
import PadLockIcon from "../_assets/icons/PadLockIcon";
import QuestionIcon from "../_assets/icons/QuestionIcon";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useJoinBg } from "~~/hooks/useJoinBg";
import { ChallengeId, UserRole } from "~~/services/database/config/types";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";
import { UserByAddress } from "~~/services/database/repositories/users";
import { getChallengeDependenciesInfo } from "~~/utils/dependent-challenges";

const JOIN_BG_DEPENDENCIES = [
  ChallengeId.SIMPLE_NFT_EXAMPLE,
  ChallengeId.DECENTRALIZED_STAKING,
  ChallengeId.TOKEN_VENDOR,
  ChallengeId.DICE_GAME,
  ChallengeId.MINIMUM_VIABLE_EXCHANGE,
];

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

  const builderAlreadyJoined = Boolean(user?.role === UserRole.BUILDER);

  if (!connectedAddress) {
    return (
      <button
        onClick={openConnectModal}
        className="flex justify-center text-[#088484] bg-[#C8F5FF] items-center text-xl lg:text-lg px-4 py-1 border-2 border-[#088484] rounded-full opacity-70"
      >
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <>
      <button
        disabled={!dependenciesCompleted || builderAlreadyJoined}
        className="flex justify-center text-[#088484] bg-[#C8F5FF] items-center text-xl lg:text-lg px-4 py-1 border-2 border-[#088484] rounded-full disabled:opacity-70"
        onClick={handleJoinBg}
      >
        {!dependenciesCompleted && <PadLockIcon className="w-6 h-6 mr-2" />}
        {!isJoiningBg && !builderAlreadyJoined && <span>Join the 🏰️ BuidlGuidl</span>}
        {isJoiningBg && <span className="mr-2">Joining...</span>}
        {builderAlreadyJoined && <span>Already joined</span>}
      </button>
      {!dependenciesCompleted && (
        <div className="tooltip relative cursor-pointer ml-2 text-[#088484]" data-tip={lockReasonToolTip}>
          <QuestionIcon className="h-8 w-8" />
        </div>
      )}
    </>
  );
};

export default JoinBGButton;
