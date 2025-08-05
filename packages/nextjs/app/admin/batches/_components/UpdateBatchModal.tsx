import { useRef } from "react";
import { BatchModalContent } from "./BatchModalContent";
import { useUpdateBatch } from "~~/hooks/useUpdateBatch";
import { BatchStatus } from "~~/services/database/config/types";
import { BatchWithCounts } from "~~/services/database/repositories/batches";

export const UPDATE_BATCH_MODAL_ID = "edit-batch-modal";

type UpdateBatchModalProps = {
  batchId: string;
  defaultName: string;
  defaultStatus: BatchStatus;
  defaultStartDate: Date;
  defaultTelegramLink: string;
  defaultRegistryAddress: string;
  defaultNetwork: string;
  refreshQueries: () => void;
  setSelectedBatch: (batch: BatchWithCounts | null) => void;
};

export const UpdateBatchModal = ({
  batchId,
  defaultName,
  defaultStatus,
  defaultStartDate,
  defaultTelegramLink,
  defaultRegistryAddress,
  defaultNetwork,
  refreshQueries,
  setSelectedBatch,
}: UpdateBatchModalProps) => {
  const modalRef = useRef<HTMLInputElement>(null);

  const { updateBatch, isPending } = useUpdateBatch({
    onSuccess: () => {
      if (modalRef.current) {
        modalRef.current.checked = false;
      }
      refreshQueries();
      setSelectedBatch(null);
    },
  });

  return (
    <BatchModalContent
      // force new modal for each batch
      key={batchId}
      ref={modalRef}
      defaultName={defaultName}
      defaultStatus={defaultStatus}
      defaultStartDate={defaultStartDate}
      defaultTelegramLink={defaultTelegramLink}
      defaultRegistryAddress={defaultRegistryAddress}
      defaultNetwork={defaultNetwork}
      updateBatch={data => updateBatch({ batchId, ...data })}
      modalId={UPDATE_BATCH_MODAL_ID}
      batchOperation="edit"
      isPending={isPending}
    />
  );
};
