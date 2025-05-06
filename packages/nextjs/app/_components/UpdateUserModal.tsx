"use client";

import { useRef, useState } from "react";
import { useBatchList } from "~~/hooks/useBatchList";
import { useUpdateUser } from "~~/hooks/useUpdateUser";
import { BatchUserStatus, UserRole } from "~~/services/database/config/types";
import { UserByAddress } from "~~/services/database/repositories/users";
import { notification } from "~~/utils/scaffold-eth";

export const UPDATE_USER_MODAL_ID = "update-user-modal";

type UpdateUserModalProps = {
  user: NonNullable<UserByAddress>;
  onSuccess?: () => void;
};

export const UpdateUserModal = ({ user, onSuccess }: UpdateUserModalProps) => {
  const modalRef = useRef<HTMLInputElement>(null);
  const [formValues, setFormValues] = useState({
    role: user.role,
    batchId: user.batchId,
    batchStatus: user.batchStatus,
  });

  const { updateUser, isPending } = useUpdateUser({
    onSuccess: () => {
      if (modalRef.current) {
        modalRef.current.checked = false;
      }
      onSuccess?.();
    },
  });

  const { data: batches } = useBatchList();

  const handleUpdate = () => {
    if (formValues.batchId && !formValues.batchStatus) {
      notification.error("Please select a batch status since a batch is selected");
      return;
    }

    updateUser({
      userAddress: user.userAddress,
      role: formValues.role,
      batchId: formValues.batchId,
      batchStatus: formValues.batchStatus,
    });
  };

  return (
    <div className="w-full">
      <input ref={modalRef} type="checkbox" id={UPDATE_USER_MODAL_ID} className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="text-xl font-bold mb-3 text-center">Edit User</h3>
          <label htmlFor={UPDATE_USER_MODAL_ID} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>

          <div className="flex flex-col gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  Role <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full rounded-full h-[2.2rem] min-h-[2.2rem] px-4"
                value={formValues.role || ""}
                onChange={e => {
                  setFormValues(prev => ({ ...prev, role: e.target.value as UserRole }));
                }}
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Batch</span>
              </label>
              <select
                className="select select-bordered w-full rounded-full h-[2.2rem] min-h-[2.2rem] px-4"
                value={formValues.batchId || ""}
                onChange={e => {
                  const newBatchId = e.target.value ? Number(e.target.value) : null;
                  setFormValues(prev => ({
                    ...prev,
                    batchId: newBatchId,
                    batchStatus: newBatchId ? BatchUserStatus.CANDIDATE : null,
                  }));
                }}
              >
                <option value="">No Batch</option>
                {batches?.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  Batch Status {formValues.batchId && <span className="text-red-500">*</span>}
                </span>
              </label>
              <select
                className="select select-bordered w-full rounded-full h-[2.2rem] min-h-[2.2rem] px-4"
                value={formValues.batchStatus || ""}
                onChange={e => {
                  setFormValues(prev => ({ ...prev, batchStatus: e.target.value as BatchUserStatus }));
                }}
                disabled={!formValues.batchId}
              >
                <option value="">No Status</option>
                {Object.values(BatchUserStatus).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6" onClick={handleUpdate}>
              <button className="btn btn-primary w-full" disabled={isPending}>
                {isPending ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor={UPDATE_USER_MODAL_ID}></label>
      </div>
    </div>
  );
};
