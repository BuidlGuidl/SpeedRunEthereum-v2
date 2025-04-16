import { SortingState } from "@tanstack/react-table";
import { BatchWithCounts } from "~~/services/database/repositories/batches";

export const getSortedBatches = async (start: number, size: number, sorting: SortingState, filter?: string) => {
  const response = await fetch(
    `/api/batches/sorted?start=${start}&size=${size}&sorting=${JSON.stringify(sorting)}&filter=${filter || ""}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch sorted batches: ${response.status} ${response.statusText}`);
  }

  const batchesData = (await response.json()) as {
    data: BatchWithCounts[];
    meta: {
      totalRowCount: number;
    };
  };

  return batchesData;
};
