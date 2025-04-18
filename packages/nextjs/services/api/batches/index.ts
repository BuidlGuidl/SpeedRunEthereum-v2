import { SortingState } from "@tanstack/react-table";
import { Batch, BatchWithCounts } from "~~/services/database/repositories/batches";

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

export async function createBatch({
  address,
  signature,
  name,
  startDate,
  status,
  contractAddress,
  telegramLink,
}: {
  address: string;
  signature: string;
  name: string;
  startDate: string;
  status: string;
  contractAddress?: string;
  telegramLink: string;
}) {
  const response = await fetch("/api/batches/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, signature, name, startDate, status, contractAddress, telegramLink }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Batch creation failed");
  }

  return data.batch as Batch;
}

export async function editBatch(
  batchId: string,
  {
    address,
    signature,
    name,
    startDate,
    status,
    contractAddress,
    telegramLink,
  }: {
    address: string;
    signature: string;
    name: string;
    startDate: string;
    status: string;
    contractAddress?: string;
    telegramLink: string;
  },
) {
  const response = await fetch(`/api/batches/${batchId}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, signature, name, startDate, status, contractAddress, telegramLink }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Batch update failed");
  }

  return data.batch as Batch;
}
