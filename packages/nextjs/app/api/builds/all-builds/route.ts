import { NextRequest } from "next/server";
import { BuildCategory, BuildType } from "~~/services/database/config/types";
import { getAllBuilds } from "~~/services/database/repositories/builds";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const nameSearch = searchParams.get("name");
    const data = await getAllBuilds({
      category: category ? (category as BuildCategory) : undefined,
      type: type ? (type as BuildType) : undefined,
      nameSearch: nameSearch || undefined,
    });

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching all builds:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
