"use client";

import { TrashIcon } from "@heroicons/react/24/solid";
import { useDeleteBuild } from "~~/hooks/useDeleteBuild";

export const DeleteBuildBtn = ({ buildId, onSuccess }: { buildId: string; onSuccess?: () => void }) => {
  const { deleteBuild, isPending } = useDeleteBuild({ onSuccess });

  return (
    <button
      className="bg-base-100 rounded-lg p-2 hover:bg-base-200 transition"
      onClick={() => deleteBuild({ buildId })}
      aria-label="Delete"
      disabled={isPending}
    >
      <TrashIcon className="h-5 w-5" />
    </button>
  );
};
