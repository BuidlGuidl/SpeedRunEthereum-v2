import { UpdateBuildPayload } from "~~/app/api/users/builds/[buildId]/update/route";
import { SubmitBuildPayload } from "~~/app/api/users/builds/submit/route";

export async function submitBuild(payload: SubmitBuildPayload) {
  if (!payload.address || !payload.signature || !payload.name) {
    throw new Error("Missing required fields");
  }

  const response = await fetch("/api/users/builds/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit build");
  }

  return response.json();
}

export async function updateBuild(payload: UpdateBuildPayload, buildId: string) {
  if (!payload.address || !payload.signature || !payload.build) {
    throw new Error("Missing required fields");
  }

  const response = await fetch(`/api/users/builds/${buildId}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update build");
  }

  return response.json();
}

export async function deleteBuild({
  address,
  signature,
  buildId,
}: {
  address: string;
  signature: `0x${string}`;
  buildId: string;
}) {
  if (!address || !signature || !buildId) {
    throw new Error("Missing required fields");
  }

  const response = await fetch(`/api/users/builds/${buildId}/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, signature, buildId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete build");
  }

  return response.json();
}
