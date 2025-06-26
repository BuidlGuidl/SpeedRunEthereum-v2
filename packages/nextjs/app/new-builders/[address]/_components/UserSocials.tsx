"use client";

import { useRef } from "react";
import { CopyValueToClipboard } from "../../../../components/CopyValueToClipboard";
import { UpdateSocialsModal } from "./UpdateSocialsModal";
import { useAccount } from "wagmi";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { UserByAddress } from "~~/services/database/repositories/users";
import { getUserSocials, getUserSocialsList } from "~~/utils/socials";

export const UserSocials = ({ user }: { user: NonNullable<UserByAddress> }) => {
  const { address } = useAccount();
  const modalRef = useRef<HTMLDialogElement>(null);
  const isProfileOwner = address?.toLowerCase() === user.userAddress.toLowerCase();

  const userSocials = getUserSocialsList(user);

  if (!userSocials.length && !isProfileOwner) {
    return null;
  }

  return (
    <div className="flex items-center justify-start gap-2">
      {Boolean(userSocials.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {userSocials
            .filter(social => social.value)
            .map(social => {
              const link = social.getLink?.(social.value as string);
              return (
                <div key={social.key} className="flex items-center">
                  {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="link">
                      <social.icon className="w-6 h-6 opacity-70" />
                    </a>
                  ) : (
                    <CopyValueToClipboard text={social.value as string} Icon={social.icon} />
                  )}
                </div>
              );
            })}
        </div>
      )}

      {isProfileOwner && (
        <button onClick={() => modalRef.current?.showModal()} className="btn btn-xs btn-ghost">
          <PencilSquareIcon className="w-4 h-4" />
        </button>
      )}

      <UpdateSocialsModal
        ref={modalRef}
        closeModal={() => modalRef.current?.close()}
        existingSocials={getUserSocials(user)}
      />
    </div>
  );
};
