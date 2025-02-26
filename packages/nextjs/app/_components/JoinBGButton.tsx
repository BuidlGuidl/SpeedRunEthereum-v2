"use client";

import React from "react";
import Link from "next/link";
import PadLockIcon from "../_assets/icons/PadLockIcon";
import QuestionIcon from "../_assets/icons/QuestionIcon";
import { useJoinBg } from "~~/hooks/useJoinBg";
import { UserByAddress } from "~~/services/database/repositories/users";

type JoinBGProps = {
  isLocked: boolean;
  user: UserByAddress;
  lockReasonToolTip: string;
};

const JoinBGButton: React.FC<JoinBGProps> = ({ isLocked, user, lockReasonToolTip }) => {
  const { walletClient, connectedAddress, onJoin } = useJoinBg({ user });

  if (!walletClient || !connectedAddress) {
    // TODO: Add connect wallet functionality
    return (
      <button className="flex justify-center text-[#088484] bg-[#C8F5FF] items-center text-xl lg:text-lg px-4 py-1 border-2 border-[#088484] rounded-full opacity-70">
        <span>Connect Wallet</span>
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href="/apply"
        className="flex justify-center text-[#088484] bg-[#C8F5FF] items-center text-xl lg:text-lg px-4 py-1 border-2 border-[#088484] rounded-full"
      >
        <span>Apply to 🏰️ BuidlGuidl</span>
      </Link>
    );
  }

  return (
    <>
      <button
        disabled={isLocked}
        className="flex justify-center text-[#088484] bg-[#C8F5FF] items-center text-xl lg:text-lg px-4 py-1 border-2 border-[#088484] rounded-full disabled:opacity-70"
        onClick={onJoin}
      >
        {isLocked && <PadLockIcon className="w-6 h-6 mr-2" />}
        <span>Join the 🏰️ BuidlGuidl</span>
      </button>
      {isLocked && (
        <div className="tooltip relative cursor-pointer ml-2 text-[#088484]" data-tip={lockReasonToolTip}>
          <QuestionIcon className="h-8 w-8" />
        </div>
      )}
    </>
  );
};

export default JoinBGButton;
