import { useRef, useState } from "react";
import { UpdateBatchModalContent } from "./UpdateBatchModalContent";
import { useCreateBatch } from "~~/hooks/useCreateBatch";

export const ADD_BATCH_MODAL_ID = "add-batch-modal";

export const AddBatchModal = ({ refreshQueries }: { refreshQueries: () => void }) => {
  const modalRef = useRef<HTMLInputElement>(null);

  const [resetModalId, setResetModalId] = useState(0);

  const { createBatch, isPending } = useCreateBatch({
    onSuccess: () => {
      if (modalRef.current) {
        modalRef.current.checked = false;
      }
      refreshQueries();
      setResetModalId(prev => prev + 1);
    },
  });

  return (
    <UpdateBatchModalContent
      // force new modal after success to reset state
      key={resetModalId}
      ref={modalRef}
      updateBatch={createBatch}
      modalId={ADD_BATCH_MODAL_ID}
      batchOperation="add"
      isPending={isPending}
    />
  );
};
