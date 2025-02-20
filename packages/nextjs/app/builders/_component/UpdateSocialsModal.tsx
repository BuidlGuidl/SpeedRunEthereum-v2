import { forwardRef, useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { InputBase } from "~~/components/scaffold-eth";
import { useUpdateSocials } from "~~/hooks/useUpdateSocials";
import { socials } from "~~/utils/socials";

type UpdateSocialsModalProps = {
  closeModal: () => void;
  initialSocials?: {
    socialTelegram?: string;
    socialTwitter?: string;
    socialGithub?: string;
    socialInstagram?: string;
    socialDiscord?: string;
    socialEmail?: string;
  };
};

export const UpdateSocialsModal = forwardRef<HTMLDialogElement, UpdateSocialsModalProps>(
  ({ closeModal, initialSocials }, ref) => {
    const [socialsData, setSocialsData] = useState({
      socialTelegram: initialSocials?.socialTelegram || "",
      socialTwitter: initialSocials?.socialTwitter || "",
      socialGithub: initialSocials?.socialGithub || "",
      socialInstagram: initialSocials?.socialInstagram || "",
      socialDiscord: initialSocials?.socialDiscord || "",
      socialEmail: initialSocials?.socialEmail || "",
    });

    const { updateSocials, isPending } = useUpdateSocials({
      onSuccess: closeModal,
    });

    return (
      <dialog ref={ref} className="modal">
        <div className="modal-box flex flex-col space-y-3">
          <form method="dialog" className="bg-secondary -mx-6 -mt-6 px-6 py-4 flex items-center justify-between">
            <div className="flex justify-between items-center">
              <p className="font-bold text-xl m-0">Update Socials</p>
            </div>
            <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost text-xl h-auto">
              ✕
            </button>
          </form>

          <div className="flex flex-col space-y-5">
            {Object.entries(socials).map(([key, social]) => (
              <div key={key} className="flex flex-col gap-1.5 w-full">
                <div className="flex items-base ml-2">
                  <span className="text-sm font-medium mr-2 leading-none">{social.label}</span>
                  <div className="tooltip" data-tip={social.placeholder}>
                    <QuestionMarkCircleIcon className="h-4 w-4" />
                  </div>
                </div>
                <InputBase
                  placeholder={social.placeholder}
                  value={socialsData[key as keyof typeof socialsData]}
                  onChange={value =>
                    setSocialsData(prev => ({
                      ...prev,
                      [key]: value,
                    }))
                  }
                />
              </div>
            ))}

            <div className="modal-action">
              <button
                className="btn btn-primary self-center"
                disabled={isPending}
                onClick={() => updateSocials(socialsData)}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Updating...
                  </>
                ) : (
                  "Update Socials"
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

UpdateSocialsModal.displayName = "UpdateSocialsModal";
