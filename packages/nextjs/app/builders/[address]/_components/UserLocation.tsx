"use client";

import { useRef, useState } from "react";
import { UpdateLocationModal } from "./UpdateLocationModal";
import { useAccount } from "wagmi";
import { UserByAddress } from "~~/services/database/repositories/users";

export const UserLocation = ({ user }: { user: NonNullable<UserByAddress> }) => {
  const { address } = useAccount();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isProfileOwner = address?.toLowerCase() === user.userAddress.toLowerCase();

  return (
    <div className="flex flex-col w-full">
      {isProfileOwner && (
        <button onClick={() => setIsModalOpen(true)} className="btn btn-xs btn-outline w-full">
          Update Location
        </button>
      )}
      <UpdateLocationModal ref={modalRef} isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
    </div>
  );
};
