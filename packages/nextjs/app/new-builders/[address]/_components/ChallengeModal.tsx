import { forwardRef } from "react";

export const ChallengeModal = forwardRef<
  HTMLDialogElement,
  {
    id: number;
    closeModal: () => void;
  }
>(({ id, closeModal }, ref) => {
  return (
    <dialog id="challenge_modal" className="modal" ref={ref}>
      <div className="modal-box flex flex-col space-y-6 rounded-lg">
        <h1>Challenge #{id}</h1>
        <button className="btn btn-sm btn-primary btn-outline" onClick={closeModal}>
          Close Modal
        </button>
      </div>
    </dialog>
  );
});

ChallengeModal.displayName = "ChallengeModal";
