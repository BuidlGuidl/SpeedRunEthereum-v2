import { forwardRef, useMemo, useState } from "react";
import { InputBase } from "~~/components/scaffold-eth";
import { BatchStatus } from "~~/services/database/config/types";
import { notification } from "~~/utils/scaffold-eth";

export type BatchOperation = "add" | "edit";

type UpdateBatchModalContentProps = {
  modalId: string;
  defaultName?: string;
  defaultStatus?: BatchStatus;
  defaultStartDate?: Date;
  defaultTelegramLink?: string;
  defaultRegistryAddress?: string;
  isPending: boolean;
  batchOperation: BatchOperation;
  updateBatch: (data: {
    name: string;
    status: BatchStatus;
    startDate: string;
    telegramLink: string;
    contractAddress: string;
    websiteUrl: string;
  }) => void;
};

export const UpdateBatchModalContent = forwardRef<HTMLInputElement, UpdateBatchModalContentProps>(
  (
    {
      defaultName = "",
      defaultStatus = BatchStatus.CLOSED,
      defaultStartDate,
      defaultTelegramLink = "",
      defaultRegistryAddress = "",
      updateBatch,
      modalId,
      batchOperation,
      isPending,
    }: UpdateBatchModalContentProps,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const [name, setName] = useState(defaultName);
    const [status, setStatus] = useState<BatchStatus>(defaultStatus);
    const [startDate, setStartDate] = useState(defaultStartDate?.toISOString().split("T")[0] ?? "");
    const [telegramLink, setTelegramLink] = useState(defaultTelegramLink);
    const [registryAddress, setRegistryAddress] = useState(defaultRegistryAddress);

    const generatedWebsiteUrl = useMemo(() => {
      return `${name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")}.buidlguidl.com`;
    }, [name]);

    const title = batchOperation === "add" ? "Add New Batch" : "Edit Batch";

    const buttonDefaultText = batchOperation === "add" ? "Add Batch" : "Update Batch";
    const buttonLoadingText = batchOperation === "add" ? "Adding..." : "Updating...";
    const buttonText = isPending ? buttonLoadingText : buttonDefaultText;

    const handleUpdateBatch = () => {
      if (!name || !startDate || !telegramLink) {
        notification.error("Please fill in all required fields");
        return;
      }
      updateBatch({
        name,
        status,
        startDate,
        telegramLink,
        contractAddress: registryAddress,
        websiteUrl: generatedWebsiteUrl,
      });
    };

    return (
      <div>
        <input ref={ref} type="checkbox" id={modalId} className="modal-toggle" />
        <div className="modal">
          <div className="modal-box relative">
            {/* dummy input to capture event onclick on modal box */}
            <input className="h-0 w-0 absolute top-0 left-0" />
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <label htmlFor={modalId} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
              ✕
            </label>

            <div className="flex flex-col gap-6">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Batch Name <span className="text-red-500">*</span>
                  </span>
                </label>
                <InputBase name="batchName" placeholder="Batch Name" value={name} onChange={setName} />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Status <span className="text-red-500">*</span>
                  </span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`status-${defaultName}`}
                      className="radio radio-primary"
                      checked={status === BatchStatus.CLOSED}
                      onChange={() => setStatus(BatchStatus.CLOSED)}
                    />
                    <span>Closed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`status-${defaultName}`}
                      className="radio radio-primary"
                      checked={status === BatchStatus.OPEN}
                      onChange={() => setStatus(BatchStatus.OPEN)}
                    />
                    <span>Open</span>
                  </label>
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Start Date <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full rounded-full h-[2.2rem] min-h-[2.2rem] px-4"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Telegram Join Link <span className="text-red-500">*</span>
                  </span>
                </label>
                <InputBase
                  name="telegramLink"
                  placeholder="https://t.me/+RdnBKIvVnDw5MTky"
                  value={telegramLink}
                  onChange={setTelegramLink}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Batch Registry Contract Address</span>
                </label>
                <InputBase
                  name="registryAddress"
                  placeholder="Registry Contract Address"
                  value={registryAddress}
                  onChange={setRegistryAddress}
                />
              </div>
            </div>

            <div className="mt-6" onClick={handleUpdateBatch}>
              <button className="btn btn-primary w-full" disabled={isPending}>
                {buttonText}
              </button>
            </div>
          </div>
          <label className="modal-backdrop" htmlFor={modalId}>
            <button>close</button>
          </label>
        </div>
      </div>
    );
  },
);

UpdateBatchModalContent.displayName = "UpdateBatchModalContent";
