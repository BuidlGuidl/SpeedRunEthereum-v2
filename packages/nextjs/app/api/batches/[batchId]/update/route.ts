import { NextResponse } from "next/server";
import { BatchStatus, SUPPORTED_NETWORKS } from "~~/services/database/config/types";
import { getBatchByBgSubdomain, getBatchById, updateBatch } from "~~/services/database/repositories/batches";
import { isUserAdmin } from "~~/services/database/repositories/users";
import { isValidEIP712UpdateBatchSignature } from "~~/services/eip712/batches";

export type UpdateBatchPayload = {
  name: string;
  address: string;
  signature: `0x${string}`;
  startDate: string;
  status: BatchStatus;
  contractAddress?: string;
  telegramLink: string;
  bgSubdomain: string;
  network?: string;
};

export async function PUT(request: Request, props: { params: Promise<{ batchId: string }> }) {
  const params = await props.params;
  try {
    const { batchId } = params;
    const {
      name,
      address,
      signature,
      startDate,
      status,
      contractAddress,
      telegramLink,
      bgSubdomain,
      network,
    }: UpdateBatchPayload = await request.json();

    if (!name || !startDate || !status || !telegramLink || !bgSubdomain) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isAdmin = await isUserAdmin(address);
    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can update batches" }, { status: 403 });
    }

    const batchWithRequestedBgSubdomain = await getBatchByBgSubdomain(bgSubdomain);
    const batchWithSameBgSubdomainExists =
      batchWithRequestedBgSubdomain && batchWithRequestedBgSubdomain.id !== Number(batchId);

    if (batchWithSameBgSubdomainExists) {
      return NextResponse.json({ error: "Batch with this website url already exists" }, { status: 401 });
    }

    const batch = await getBatchById(Number(batchId));
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const isValidSignature = await isValidEIP712UpdateBatchSignature({
      address,
      signature,
      name,
      startDate,
      status,
      contractAddress: contractAddress || "",
      telegramLink,
      bgSubdomain,
      network: network || SUPPORTED_NETWORKS.NONE,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const updatedBatch = await updateBatch(Number(batchId), {
      name,
      startDate: new Date(startDate),
      status,
      contractAddress,
      telegramLink,
      bgSubdomain,
      network,
    });

    return NextResponse.json({ batch: updatedBatch });
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json({ error: "Failed to update batch" }, { status: 500 });
  }
}
