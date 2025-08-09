import { SortingState } from "@tanstack/react-table";
import { UpdateBatchPayload } from "~~/app/api/batches/[batchId]/update/route";
import { CreateBatchPayload } from "~~/app/api/batches/create/route";
import { Batch, BatchWithCounts } from "~~/services/database/repositories/batches";

export const fetchSortedBatches = async ({
  start,
  size,
  sorting,
  filter,
}: {
  start: number;
  size: number;
  sorting: SortingState;
  filter?: string;
}) => {
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

export async function fetchBatchNameList() {
  const response = await fetch("/api/batches/name-list");
  if (!response.ok) {
    throw new Error("Failed to fetch batch name list");
  }
  const data = await response.json();
  return data.batches as Pick<NonNullable<Batch>, "id" | "name">[];
}

export async function fetchCreateBatch({
  address,
  signature,
  name,
  startDate,
  status,
  contractAddress,
  telegramLink,
  bgSubdomain,
  network,
}: CreateBatchPayload) {
  const response = await fetch("/api/batches/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
      signature,
      name,
      startDate,
      status,
      contractAddress,
      telegramLink,
      bgSubdomain,
      network,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Batch creation failed");
  }

  return data.batch as Batch;
}

export async function fetchUpdateBatch(
  batchId: string,
  {
    address,
    signature,
    name,
    startDate,
    status,
    contractAddress,
    telegramLink,
    bgSubdomain,
    network,
  }: UpdateBatchPayload,
) {
  const response = await fetch(`/api/batches/${batchId}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
      signature,
      name,
      startDate,
      status,
      contractAddress,
      telegramLink,
      bgSubdomain,
      network,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Batch update failed");
  }

  return data.batch as Batch;
}

export async function fetchLatestOpenBatch() {
  const response = await fetch("/api/batches/latest-open");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch active batch");
  }

  return data.batch as Batch;
}
