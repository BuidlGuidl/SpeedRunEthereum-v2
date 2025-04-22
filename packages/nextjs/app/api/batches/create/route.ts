import { NextResponse } from "next/server";
import { BatchStatus } from "~~/services/database/config/types";
import { createBatch, getBatchByName } from "~~/services/database/repositories/batches";
import { isUserAdmin } from "~~/services/database/repositories/users";
import { isValidEIP712CreateBatchSignature } from "~~/services/eip712/batches";

export type CreateBatchPayload = {
  name: string;
  address: string;
  signature: `0x${string}`;
  startDate: string;
  status: BatchStatus;
  contractAddress?: string;
  telegramLink: string;
  websiteUrl: string;
};

export async function POST(req: Request) {
  try {
    const { address, signature, name, startDate, status, contractAddress, telegramLink, websiteUrl } =
      (await req.json()) as CreateBatchPayload;

    if (!address || !signature || !name || !startDate || !status || !telegramLink || !websiteUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isAdmin = await isUserAdmin(address);
    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can create batches" }, { status: 403 });
    }

    const batchExist = await getBatchByName(name);

    if (batchExist) {
      return NextResponse.json({ error: "Batch with this name already exists" }, { status: 401 });
    }

    const isValidSignature = await isValidEIP712CreateBatchSignature({
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

    const batch = await createBatch({
      name,
      startDate: new Date(startDate),
      status,
      contractAddress: contractAddress || null,
      telegramLink,
      websiteUrl,
    });

    return NextResponse.json({ batch }, { status: 200 });
  } catch (error) {
    console.error("Error during batch creation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
