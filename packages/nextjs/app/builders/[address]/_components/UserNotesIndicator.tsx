"use client";

import { USER_NOTES_MODAL_ID } from "~~/app/_components/UserNotesModal";
import { useUserNotes } from "~~/hooks/useUserNotes";
import { UserByAddress } from "~~/services/database/repositories/users";

type UserNotesIndicatorProps = {
  user: NonNullable<UserByAddress>;
};

export const UserNotesIndicator = ({ user }: UserNotesIndicatorProps) => {
  const { data: notes, isLoading } = useUserNotes(user.userAddress);

  if (isLoading) {
    return (
      <div className="absolute top-2 right-2">
        <div className="loading loading-spinner loading-sm"></div>
      </div>
    );
  }

  const notesCount = notes?.length || 0;

  return (
    <label
      htmlFor={USER_NOTES_MODAL_ID}
      className="absolute top-[-15px] right-[-15px] btn btn-sm btn-circle btn-warning cursor-pointer tooltip tooltip-left items-center justify-center flex"
      data-tip="private notes"
    >
      <div className="">{notesCount}</div>
    </label>
  );
};
