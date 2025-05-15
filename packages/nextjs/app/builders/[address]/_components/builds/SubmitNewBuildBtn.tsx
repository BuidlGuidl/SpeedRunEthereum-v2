"use client";

import { useRef } from "react";
import { BuildFormModal } from "./BuildFormModal";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useSubmitBuild } from "~~/hooks/useSubmitBuild";

export const SubmitNewBuildBtn = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const { submitBuild, isPending } = useSubmitBuild({
    onSuccess: () => {
      modalRef.current?.close();
    },
  });

  return (
    <>
      <button className="btn btn-primary btn-sm mb-4" onClick={() => modalRef.current?.showModal()}>
        <PlusIcon className="w-4 h-4" />
        New Build
      </button>
      <BuildFormModal
        ref={modalRef}
        closeModal={() => modalRef.current?.close()}
        buttonAction={submitBuild}
        buttonText="Submit"
        isPending={isPending}
      />
    </>
  );
};
