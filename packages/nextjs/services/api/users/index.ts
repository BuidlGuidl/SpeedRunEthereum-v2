import { UserByAddress } from "~~/services/database/respositories/users";

export async function fetchUser(address: string | undefined) {
  if (!address) return null;

  const response = await fetch(`/api/users/${address}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
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
