"use client";

import { useRef } from "react";
import { useParams } from "next/navigation";
import { BuildFormModal } from "./BuildFormModal";
import { useAccount } from "wagmi";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useSubmitBuild } from "~~/hooks/useSubmitBuild";

export const SubmitNewBuildBtn = () => {
  const { address: connectedAddress } = useAccount();
  const { address: profileAddress } = useParams();

  const modalRef = useRef<HTMLDialogElement>(null);

  const { submitBuild, isPending } = useSubmitBuild({
    onSuccess: () => {
      modalRef.current?.close();
    },
  });

  if (connectedAddress !== profileAddress) {
    return null;
  }

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
