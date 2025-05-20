import { NextResponse } from "next/server";
import { getLatestOpenBatch } from "~~/services/database/repositories/batches";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const batch = await getLatestOpenBatch();
    return NextResponse.json({ batch });
  } catch (error) {
    console.error("Error fetching active batch:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
