import { NextResponse } from "next/server";
import { BatchStatus } from "~~/services/database/config/types";
import { getBatchById, updateBatch } from "~~/services/database/repositories/batches";
import { isUserAdmin } from "~~/services/database/repositories/users";
import { isValidEIP712EditBatchSignature } from "~~/services/eip712/batches";

export type UpdateBatchPayload = {
  name: string;
  address: string;
  signature: `0x${string}`;
  startDate: string;
  status: BatchStatus;
  contractAddress?: string;
  telegramLink: string;
  websiteUrl: string;
};

export async function PUT(request: Request, { params }: { params: { batchId: string } }) {
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
      websiteUrl,
    }: UpdateBatchPayload = await request.json();

    if (!name || !startDate || !status || !telegramLink || !websiteUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isAdmin = await isUserAdmin(address);
    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can update batches" }, { status: 403 });
    }

    const batch = await getBatchById(batchId);
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const isValidSignature = await isValidEIP712EditBatchSignature({
      address,
      signature,
      name,
      startDate,
      status,
      contractAddress: contractAddress || "",
      telegramLink,
      websiteUrl,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const updatedBatch = await updateBatch(batchId, {
      name,
      startDate: new Date(startDate),
      status,
      contractAddress,
      telegramLink,
      websiteUrl,
    });

    return NextResponse.json({ batch: updatedBatch });
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json({ error: "Failed to update batch" }, { status: 500 });
  }
}
