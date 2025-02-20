"use client";

import { useRef } from "react";
import { UpdateSocialsModal } from "./UpdateSocialsModal";
import { useAccount } from "wagmi";
import { UserByAddress } from "~~/services/database/repositories/users";
import { socials } from "~~/utils/socials";

export const UserSocials = ({ user }: { user: UserByAddress }) => {
  const { address } = useAccount();
  const modalRef = useRef<HTMLDialogElement>(null);
  const isProfileOwner = address?.toLowerCase() === user.userAddress.toLowerCase();

  const userSocials = Object.entries(socials)
    .map(([key, social]) => ({
      ...social,
      value: (user[key as keyof typeof user] as string | null) || "",
      key,
    }))
    .filter(social => social.value)
    .sort((a, b) => a.weight - b.weight);

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
          {userSocials.map(social => {
            const link = social.getLink(social.value);
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
        initialSocials={{
          socialTelegram: user.socialTelegram || "",
          socialTwitter: user.socialTwitter || "",
          socialGithub: user.socialGithub || "",
          socialInstagram: user.socialInstagram || "",
          socialDiscord: user.socialDiscord || "",
          socialEmail: user.socialEmail || "",
        }}
      />
    </div>
  );
};
