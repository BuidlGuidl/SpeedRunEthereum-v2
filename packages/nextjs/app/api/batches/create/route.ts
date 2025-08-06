import { NextResponse } from "next/server";
import { BatchNetwork, BatchStatus } from "~~/services/database/config/types";
import { createBatch, getBatchByBgSubdomain } from "~~/services/database/repositories/batches";
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
  bgSubdomain: string;
  network: BatchNetwork;
};

export async function POST(req: Request) {
  try {
    const { address, signature, name, startDate, status, contractAddress, telegramLink, bgSubdomain, network } =
      (await req.json()) as CreateBatchPayload;

    if (!address || !signature || !name || !startDate || !status || !telegramLink || !bgSubdomain) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isAdmin = await isUserAdmin(address);
    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can create batches" }, { status: 403 });
    }

    const batchExist = await getBatchByBgSubdomain(bgSubdomain);

    if (batchExist) {
      return NextResponse.json({ error: "Batch with this website url already exists" }, { status: 401 });
    }

    const isValidSignature = await isValidEIP712CreateBatchSignature({
      address,
      signature,
      name,
      startDate,
      status,
      contractAddress: contractAddress || "",
      telegramLink,
      bgSubdomain,
      network: network,
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
      bgSubdomain,
      network,
    });

    return NextResponse.json({ batch }, { status: 200 });
  } catch (error) {
    console.error("Error during batch creation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
