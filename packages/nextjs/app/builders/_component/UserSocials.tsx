"use client";

import { useRef } from "react";
import { UpdateSocialsModal } from "./UpdateSocialsModal";
import { useAccount } from "wagmi";
import { UserByAddress } from "~~/services/database/repositories/users";
import { getUserSocials, getUserSocialsList, socials } from "~~/utils/socials";

export const UserSocials = ({ user }: { user: UserByAddress }) => {
  const { address } = useAccount();
  const modalRef = useRef<HTMLDialogElement>(null);
  const isProfileOwner = address?.toLowerCase() === user.userAddress.toLowerCase();

  const userSocials = getUserSocialsList(user);

  const openModal = () => {
    modalRef.current?.showModal();
  };

  return (
    <div className="flex flex-col gap-8 py-8 px-4 lg:px-8 max-w-md">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Socials</h2>
      </div>

      {userSocials.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {userSocials
            .filter(social => social.value)
            .map(social => {
              const link = social.getLink(social.value as string);
              return (
                <div key={social.key} className="badge badge-outline gap-2 p-4">
                  <span className="font-bold">{social.label}:</span>
                  {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="link">
                      {social.value}
                    </a>
                  ) : (
                    <span>{social.value}</span>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-base-content/70">No socials added yet</div>
      )}

      {isProfileOwner && (
        <button onClick={openModal} className="btn btn-sm btn-primary">
          Update Socials
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
