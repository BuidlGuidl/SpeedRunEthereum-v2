import { SortingState } from "@tanstack/react-table";
import { UpdateLocationPayload } from "~~/app/api/users/update-location/route";
import { UpdateSocialsPayload } from "~~/app/api/users/update-socials/route";
import { BatchBuilder, UserByAddress, UserWithChallengesData } from "~~/services/database/repositories/users";

export async function fetchUser(address: string | undefined) {
  if (!address) return;

  const response = await fetch(`/api/users/${address}`);
  if (!response.ok) {
    if (response.status === 404) {
      return;
    }
    throw new Error("Failed to fetch user");
  }
  const data = await response.json();
  return data.user as UserByAddress;
}

export async function registerUser({
  address,
  signature,
  referrer,
  originalUtmParams,
  eventPath,
  eventTrigger,
}: {
  address: string;
  signature: string;
  referrer: string | null;
  originalUtmParams?: Record<string, string>;
  eventPath?: string;
  eventTrigger?: string;
}) {
  const response = await fetch("/api/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, signature, referrer, originalUtmParams, eventPath, eventTrigger }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data.user as UserByAddress;
}

export async function updateSocials(payload: UpdateSocialsPayload) {
  const response = await fetch("/api/users/update-socials", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update socials");
  }

  return response.json();
}

export async function updateLocation(payload: UpdateLocationPayload) {
  const response = await fetch("/api/users/update-location", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update location");
  }

  return response.json();
}

export const getSortedUsersWithChallenges = async ({
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
    `/api/users/sorted?start=${start}&size=${size}&sorting=${JSON.stringify(sorting)}&filter=${filter ?? ""}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch sorted users: ${response.status} ${response.statusText}`);
  }

  const usersData = (await response.json()) as {
    data: UserWithChallengesData[];
    meta: {
      totalRowCount: number;
    };
  };

  return usersData;
};

export const getSortedBatchBuilders = async ({
  start,
  size,
  sorting,
  filter,
  batchId,
}: {
  start: number;
  size: number;
  sorting: SortingState;
  filter?: string;
  batchId?: number;
}) => {
  const response = await fetch(
    `/api/users/in-batches?start=${start}&size=${size}&sorting=${JSON.stringify(sorting)}&filter=${filter ?? ""}&batchId=${batchId ?? ""}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch sorted batch builders: ${response.status} ${response.statusText}`);
  }

  const batchBuildersData = (await response.json()) as {
    data: BatchBuilder[];
    meta: {
      totalRowCount: number;
    };
  };

  return batchBuildersData;
};

export async function userJoinBatch({ address, signature }: { address: string; signature: string }) {
  const response = await fetch("/api/users/join-batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, signature }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to join batch");
  }

  return data.user as NonNullable<UserByAddress>;
}
