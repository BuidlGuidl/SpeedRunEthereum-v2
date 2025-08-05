import { NextRequest } from "next/server";
import { getSortedBatchBuilders } from "~~/services/database/repositories/users";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start = parseInt(searchParams.get("start") ?? "0");
    const size = parseInt(searchParams.get("size") ?? "0");
    const sorting = JSON.parse(searchParams.get("sorting") ?? "[]");
    const filter = searchParams.get("filter");
    const batchId = searchParams.get("batchId");

    const data = await getSortedBatchBuilders({
      start,
      size,
      sorting,
      filter: filter ?? undefined,
      batchId: batchId ? parseInt(batchId) : undefined,
    });

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching batch builders:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
