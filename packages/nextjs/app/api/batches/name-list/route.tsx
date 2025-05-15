import { NextResponse } from "next/server";
import { getBatchNameList } from "~~/services/database/repositories/batches";

export async function GET() {
  try {
    const batches = await getBatchNameList();
    return NextResponse.json({ batches });
  } catch (error) {
    console.error("Error fetching batch name list:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
