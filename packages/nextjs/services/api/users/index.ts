import { SortingState } from "@tanstack/react-table";
import { UpdateSocialsPayload } from "~~/app/api/users/update-socials/route";
import { UserByAddress } from "~~/services/database/repositories/users";

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

export async function registerUser({ address, signature }: { address: string; signature: string }) {
  const response = await fetch("/api/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, signature }),
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

export const getSortedUsersGroup = async (start: number, size: number, sorting: SortingState) => {
  const response = await fetch(`/api/users/sorted?start=${start}&size=${size}&sorting=${JSON.stringify(sorting)}`);
  const usersData = (await response.json()) as {
    data: UserByAddress[];
    meta: {
      totalRowCount: number;
    };
  };

  return usersData;
};
