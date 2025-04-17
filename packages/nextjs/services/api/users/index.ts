import { SortingState } from "@tanstack/react-table";
import { UpdateLocationPayload } from "~~/app/api/users/update-location/route";
import { UpdateSocialsPayload } from "~~/app/api/users/update-socials/route";
import { UserByAddress, UserWithChallengesData } from "~~/services/database/repositories/users";

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

export const getSortedUsersWithChallenges = async (start: number, size: number, sorting: SortingState) => {
  const response = await fetch(`/api/users/sorted?start=${start}&size=${size}&sorting=${JSON.stringify(sorting)}`);

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

export async function userJoinBg({ address, signature }: { address: string; signature: string }) {
  const response = await fetch("/api/users/join-bg", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, signature }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to join BuidlGuidl");
  }

  return data.user as NonNullable<UserByAddress>;
}
