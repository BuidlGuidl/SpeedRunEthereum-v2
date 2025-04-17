import { useRef, useState } from "react";
import { InputBase } from "~~/components/scaffold-eth";
import { useCreateBatch } from "~~/hooks/useCreateBatch";
import { BatchStatus } from "~~/services/database/config/types";

export const AddBatchModal = ({ refreshQueries }: { refreshQueries: () => void }) => {
  const modalRef = useRef<HTMLInputElement>(null);
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchStatus, setNewBatchStatus] = useState<BatchStatus>(BatchStatus.CLOSED);
  const [newBatchStartDate, setNewBatchStartDate] = useState("");
  const [newBatchTelegramLink, setNewBatchTelegramLink] = useState("");
  const [newBatchRegistryAddress, setNewBatchRegistryAddress] = useState("");

  const { createBatch, isPending } = useCreateBatch({
    onSuccess: () => {
      setNewBatchName("");
      setNewBatchStatus(BatchStatus.CLOSED);
      setNewBatchStartDate("");
      setNewBatchTelegramLink("");
      setNewBatchRegistryAddress("");
      if (modalRef.current) {
        modalRef.current.checked = false;
      }
      refreshQueries();
    },
  });

  const handleAddBatch = () => {
    createBatch({
      name: newBatchName,
      status: newBatchStatus,
      startDate: newBatchStartDate,
      telegramLink: newBatchTelegramLink,
      contractAddress: newBatchRegistryAddress,
    });
  };

  return (
    <>
      <input ref={modalRef} type="checkbox" id="add-batch-modal" className="modal-toggle" />
      <label htmlFor="add-batch-modal" className="modal cursor-pointer">
        <label className="modal-box relative">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="text-xl font-bold mb-3">Add New Batch</h3>
          <label htmlFor="add-batch-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>

          <div className="flex flex-col gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  Batch Name <span className="text-red-500">*</span>
                </span>
              </label>
              <InputBase name="batchName" placeholder="Batch Name" value={newBatchName} onChange={setNewBatchName} />
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
                    name="status"
                    className="radio"
                    checked={newBatchStatus === BatchStatus.CLOSED}
                    onChange={() => setNewBatchStatus(BatchStatus.CLOSED)}
                  />
                  <span>closed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    className="radio"
                    checked={newBatchStatus === BatchStatus.OPEN}
                    onChange={() => setNewBatchStatus(BatchStatus.OPEN)}
                  />
                  <span>open</span>
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
                value={newBatchStartDate}
                onChange={e => setNewBatchStartDate(e.target.value)}
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
                value={newBatchTelegramLink}
                onChange={setNewBatchTelegramLink}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Batch Registry Contract Address</span>
              </label>
              <InputBase
                name="registryAddress"
                placeholder="Registry Contract Address"
                value={newBatchRegistryAddress}
                onChange={setNewBatchRegistryAddress}
              />
            </div>
          </div>

          <div className="mt-6">
            <button className="btn btn-primary w-full" disabled={isPending} onClick={handleAddBatch}>
              {isPending ? "Adding..." : "Add Batch"}
            </button>
          </div>
        </label>
      </label>
    </>
  );
};
