"use client";

import { useRef } from "react";
import { BuildFormModal } from "./BuildFormModal";
import { PlusIcon } from "@heroicons/react/24/outline";

export const SubmitNewBuildBtn = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={() => modalRef.current?.showModal()}>
        <PlusIcon className="w-4 h-4" />
        New Build
      </button>
      <BuildFormModal ref={modalRef} closeModal={() => modalRef.current?.close()} />
    </>
  );
};
