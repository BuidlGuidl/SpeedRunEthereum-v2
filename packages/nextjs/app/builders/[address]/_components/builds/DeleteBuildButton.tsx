"use client";

import { useAccount } from "wagmi";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useAuthSession } from "~~/hooks/useAuthSession";
import { useDeleteBuild } from "~~/hooks/useDeleteBuild";

export const DeleteBuildButton = ({ buildId, ownerAddress }: { buildId: string; ownerAddress: string }) => {
  const { isAdmin } = useAuthSession();
  const { deleteBuild, isPending } = useDeleteBuild();
  const { address: contentAddress } = useAccount();

  if (!isAdmin && contentAddress !== ownerAddress) {
    return null;
  }

  return (
    <button
      className="bg-base-100 rounded-lg p-2 hover:bg-base-200 transition"
      onClick={() => deleteBuild({ buildId, ownerAddress })}
      aria-label="Delete"
      disabled={isPending}
    >
      {isPending ? <span className="loading loading-spinner loading-sm"></span> : <TrashIcon className="h-5 w-5" />}
    </button>
  );
};
