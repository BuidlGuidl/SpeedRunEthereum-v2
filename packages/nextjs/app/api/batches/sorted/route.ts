import { NextRequest, NextResponse } from "next/server";
import { getSortedBatches } from "~~/services/database/repositories/batches";
import { isAdminSession } from "~~/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const start = parseInt(searchParams.get("start") ?? "0");
    const size = parseInt(searchParams.get("size") ?? "0");
    const sorting = JSON.parse(searchParams.get("sorting") ?? "[]");
    const filter = searchParams.get("filter");
    const data = await getSortedBatches(start, size, sorting, filter || "");

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching sorted batches:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
