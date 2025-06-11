import { forwardRef, useEffect, useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import { useUpdateLocation } from "~~/hooks/useUpdateLocation";
import { UserLocation } from "~~/services/database/repositories/users";

type UpdateLocationModalProps = {
  closeModal: () => void;
  existingLocation: UserLocation;
  isOpen: boolean;
};

export const UpdateLocationModal = forwardRef<HTMLDivElement, UpdateLocationModalProps>(
  ({ closeModal, existingLocation, isOpen }, ref) => {
    const [selectedCountry, setSelectedCountry] = useState(existingLocation || "");
    const { updateLocation, isPending } = useUpdateLocation({
      onSuccess: closeModal,
    });

    useEffect(() => {
      if (!isOpen) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeModal();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen, closeModal]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-[#0006]" onClick={closeModal} />
        <div
          ref={ref}
          className="bg-base-100 rounded-xl w-full max-w-md mx-4 shadow-xl relative z-[51]"
          style={{ animation: "modal-pop 0.2s ease-out" }}
        >
          <div className="bg-secondary px-6 py-4 rounded-t-xl flex items-center justify-between">
            <h3 className="font-bold text-xl m-0">Update Location</h3>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost text-xl h-auto hover:bg-base-200/10"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="w-full flag-selector">
              <ReactFlagsSelect
                selected={selectedCountry}
                onSelect={code => setSelectedCountry(code)}
                searchable
                placeholder="Select your country"
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                disabled={isPending}
                onClick={async () => {
                  setSelectedCountry("");
                }}
              >
                Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={() => updateLocation(selectedCountry)}
                disabled={isPending || selectedCountry === (existingLocation ?? "")}
              >
                Update Location
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

UpdateLocationModal.displayName = "UpdateLocationModal";
