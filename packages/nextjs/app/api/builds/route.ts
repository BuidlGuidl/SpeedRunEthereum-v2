import { NextRequest } from "next/server";
import { BuildCategory, BuildType } from "~~/services/database/config/types";
import { getAllBuilds } from "~~/services/database/repositories/builds";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const nameSearch = searchParams.get("name");
    const start = Number(searchParams.get("start") || 0);
    const size = Number(searchParams.get("size") || 48);
    const data = await getAllBuilds({
      category: category ? (category as BuildCategory) : undefined,
      type: type ? (type as BuildType) : undefined,
      nameSearch: nameSearch || undefined,
      start,
      size,
    });

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching all builds:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
