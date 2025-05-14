"use client";

import { useRef } from "react";
import { BuildFormInputs, BuildFormModal } from "./BuildFormModal";
import { useAccount } from "wagmi";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useUpdateBuild } from "~~/hooks/useUpdateBuild";

type EditBuildBtnProps = {
  build: BuildFormInputs;
  buildId: string;
  ownerAddress: string;
};

export const EditBuildBtn = ({ build, buildId, ownerAddress }: EditBuildBtnProps) => {
  const { address: connectedAddress } = useAccount();

  const modalRef = useRef<HTMLDialogElement>(null);

  const { updateBuild, isPending } = useUpdateBuild({
    onSuccess: () => {
      modalRef.current?.close();
    },
  });

  const handleUpdateBuild = (form: BuildFormInputs) => {
    updateBuild({ build: form, buildId });
  };

  if (!connectedAddress || connectedAddress !== ownerAddress) {
    return null;
  }

  return (
    <>
      <button
        className="bg-base-100 rounded-lg p-2 hover:bg-base-200 transition"
        onClick={() => modalRef.current?.showModal()}
        aria-label="Edit"
      >
        <PencilSquareIcon className="h-5 w-5" />
      </button>
      <BuildFormModal
        ref={modalRef}
        build={build}
        closeModal={() => modalRef.current?.close()}
        buttonAction={handleUpdateBuild}
        buttonText="Update"
        isPending={isPending}
      />
    </>
  );
};
