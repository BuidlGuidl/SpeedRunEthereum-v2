import { forwardRef, useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { InputBase } from "~~/components/scaffold-eth";
import { useSubmitChallenge } from "~~/hooks/useSubmitChallenge";

type SubmitChallengeModalProps = {
  challengeId: string;
  closeModal: () => void;
};

export const SubmitChallengeModal = forwardRef<HTMLDialogElement, SubmitChallengeModalProps>(
  ({ closeModal, challengeId }, ref) => {
    const [frontendUrl, setFrontendUrl] = useState("");
    const [contractUrl, setContractUrl] = useState("");

    const { submitChallenge, isPending } = useSubmitChallenge({
      onSuccess: closeModal,
    });

    return (
      <dialog ref={ref} className="modal">
        <div className="modal-box flex flex-col space-y-3">
          <form method="dialog" className="bg-secondary -mx-6 -mt-6 px-6 py-4 flex items-center justify-between">
            <div className="flex justify-between items-center">
              <p className="font-bold text-xl m-0">Submit Challenge</p>
            </div>
            <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost text-xl h-auto">
              ✕
            </button>
          </form>

          <h1 className="text-2xl font-semibold ml-2">{challengeId}</h1>

          <div className="flex flex-col space-y-5">
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-base ml-2">
                <span className="text-sm font-medium mr-2 leading-none">Deployed URL</span>
                <div className="tooltip" data-tip="Your deployed challenge URL on vercel">
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                </div>
              </div>
              <InputBase
                placeholder="https://your-site.vercel.app"
                value={frontendUrl}
                onChange={e => setFrontendUrl(e)}
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-base ml-2">
                <span className="text-sm font-medium mr-2 leading-none">Etherscan URL</span>
                <div className="tooltip" data-tip="Your verfied contract URL on etherscan">
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                </div>
              </div>
              <InputBase
                placeholder="https://sepolia.etherscan.io/address/**YourContractAddress**"
                value={contractUrl}
                onChange={e => setContractUrl(e)}
              />
            </div>

            <div className="modal-action">
              <button
                className="btn btn-primary self-center"
                disabled={!Boolean(frontendUrl && contractUrl) || isPending}
                onClick={() => submitChallenge({ challengeId, frontendUrl, contractUrl })}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Challenge"
                )}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    );
  },
);

SubmitChallengeModal.displayName = "SubmitChallengeModal";
