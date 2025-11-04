"use client";

import { useRef, useState } from "react";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { useCreateUserNote, useDeleteUserNote, useUserNotes } from "~~/hooks/useUserNotes";
import { UserByAddress } from "~~/services/database/repositories/users";
import { formatDate } from "~~/utils/date";

export const USER_NOTES_MODAL_ID = "user-notes-modal";

type UserNotesModalProps = {
  user: NonNullable<UserByAddress>;
};

export const UserNotesModal = ({ user }: UserNotesModalProps) => {
  const modalRef = useRef<HTMLInputElement>(null);
  const [newComment, setNewComment] = useState("");

  const { data: notes, isLoading } = useUserNotes(user.userAddress);
  const { createUserNote, isPending: isCreating } = useCreateUserNote();
  const { deleteUserNote, isPending: isDeleting } = useDeleteUserNote();

  const handleCreateNote = () => {
    if (!newComment.trim()) return;

    createUserNote(
      {
        userAddress: user.userAddress,
        comment: newComment.trim(),
      },
      {
        onSuccess: () => {
          setNewComment("");
        },
      },
    );
  };

  const handleDeleteNote = (noteId: number) => {
    deleteUserNote({
      userAddress: user.userAddress,
      noteId,
    });
  };

  return (
    <div className="w-full">
      <input ref={modalRef} type="checkbox" id={USER_NOTES_MODAL_ID} className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative space-y-3 max-w-2xl">
          <div className="bg-secondary -mx-6 -mt-6 px-6 py-4 rounded-t-xl flex items-center justify-between">
            <h3 className="text-xl font-semibold m-0">Private Notes</h3>
            <label htmlFor={USER_NOTES_MODAL_ID} className="btn btn-sm btn-circle btn-ghost text-xl h-auto">
              ✕
            </label>
          </div>

          <div className="flex flex-col gap-4">
            {/* Add new note section */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Add New Note</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full min-h-[100px] rounded-md"
                placeholder="Enter your note here..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                disabled={isCreating}
              />
              <div className="mt-2 flex justify-end">
                <button
                  className="btn btn-primary btn-sm"
                  disabled={isCreating || !newComment.trim()}
                  onClick={handleCreateNote}
                >
                  {isCreating ? <span className="loading loading-spinner loading-sm"></span> : "Add Note"}
                </button>
              </div>
            </div>

            {/* Existing notes section */}
            <div className="divider">Existing Notes</div>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.map(note => (
                  <div key={note.id} className="bg-base-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-base-content/60">{formatDate(note.createdAt)}</span>
                      <button
                        className="btn btn-xs btn-error btn-outline"
                        disabled={isDeleting}
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.comment}</p>
                    <div className="flex justify-between items-start mb-2">
                      <Address address={note.author.userAddress} size="sm" cachedEns={note.author.ens} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/60">
                <p>No notes yet. Add the first note above.</p>
              </div>
            )}
          </div>
        </div>
        <label className="modal-backdrop" htmlFor={USER_NOTES_MODAL_ID}></label>
      </div>
    </div>
  );
};
