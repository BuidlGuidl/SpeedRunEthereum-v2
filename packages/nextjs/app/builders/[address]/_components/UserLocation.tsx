"use client";

import { useRef, useState } from "react";
import { UpdateLocationModal } from "./UpdateLocationModal";
import ReactCountryFlag from "react-country-flag";
import { Ag, Be, Cg, Es, Us } from "react-flags-select";
import { useAccount } from "wagmi";
import { UserByAddress } from "~~/services/database/repositories/users";

export const UserLocation = ({ user }: { user: NonNullable<UserByAddress> }) => {
  const { address } = useAccount();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isProfileOwner = address?.toLowerCase() === user.userAddress.toLowerCase();

  return (
    <div className="flex flex-col w-full">
      <div className="self-center">
        {user.location ? (
          <div className="tooltip" data-tip={user.location}>
            <ReactCountryFlag
              countryCode={user.location || ""}
              className="emojiFlag"
              style={{
                fontSize: "1em",
                lineHeight: "1em",
                marginBottom: "0.8rem",
              }}
              aria-label={user.location || ""}
            />
          </div>
        ) : (
          isProfileOwner && (
            <div className="flex gap-2 opacity-20 mb-4">
              <Us />
              <Ag />
              <Be />
              <Es />
              <Cg />
            </div>
          )
        )}
      </div>
      {isProfileOwner && (
        <button onClick={() => setIsModalOpen(true)} className="btn btn-xs btn-outline w-full">
          Update Location
        </button>
      )}
      <UpdateLocationModal
        ref={modalRef}
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        existingLocation={user.location}
      />
    </div>
  );
};
