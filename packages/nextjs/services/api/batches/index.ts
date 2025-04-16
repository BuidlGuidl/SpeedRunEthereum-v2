import { SortingState } from "@tanstack/react-table";
import { Batch } from "~~/services/database/repositories/batches";

export const getSortedBatches = async (start: number, size: number, sorting: SortingState) => {
  const response = await fetch(`/api/batches/sorted?start=${start}&size=${size}&sorting=${JSON.stringify(sorting)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch sorted batches: ${response.status} ${response.statusText}`);
  }

  const batchesData = (await response.json()) as {
    data: Batch[];
    meta: {
      totalRowCount: number;
    };
  };

  return batchesData;
};
