import { useRef } from "react";
import { UpdateBatchModalContent } from "./UpdateBatchModalContent";
import { useEditBatch } from "~~/hooks/useEditBatch";
import { BatchStatus } from "~~/services/database/config/types";
import { BatchWithCounts } from "~~/services/database/repositories/batches";

export const EDIT_BATCH_MODAL_ID = "edit-batch-modal";

type EditBatchModalProps = {
  batchId: string;
  defaultName: string;
  defaultStatus: BatchStatus;
  defaultStartDate: Date;
  defaultTelegramLink: string;
  defaultRegistryAddress: string;
  refreshQueries: () => void;
  setSelectedBatch: (batch: BatchWithCounts | null) => void;
};

export const EditBatchModal = ({
  batchId,
  defaultName,
  defaultStatus,
  defaultStartDate,
  defaultTelegramLink,
  defaultRegistryAddress,
  refreshQueries,
  setSelectedBatch,
}: EditBatchModalProps) => {
  const modalRef = useRef<HTMLInputElement>(null);

  const { editBatch, isPending } = useEditBatch({
    onSuccess: () => {
      if (modalRef.current) {
        modalRef.current.checked = false;
      }
      refreshQueries();
      setSelectedBatch(null);
    },
  });

  return (
    <UpdateBatchModalContent
      // force new modal for each batch
      key={batchId}
      ref={modalRef}
      defaultName={defaultName}
      defaultStatus={defaultStatus}
      defaultStartDate={defaultStartDate}
      defaultTelegramLink={defaultTelegramLink}
      defaultRegistryAddress={defaultRegistryAddress}
      updateBatch={data => editBatch({ batchId, ...data })}
      modalId={EDIT_BATCH_MODAL_ID}
      batchOperation="edit"
      isPending={isPending}
    />
  );
};
