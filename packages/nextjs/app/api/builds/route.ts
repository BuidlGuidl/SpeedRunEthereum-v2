import { NextRequest } from "next/server";
import { BuildCategory, BuildType } from "~~/services/database/config/types";
import { BuildSort, BuildSortDirection, getAllBuilds } from "~~/services/database/repositories/builds";

const ALLOWED_SORTS: BuildSort[] = ["likes", "name", "date"];
const ALLOWED_DIRECTIONS: BuildSortDirection[] = ["asc", "desc"];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const nameSearch = searchParams.get("name");
    const sortParam = searchParams.get("sort") as BuildSort | null;
    const directionParam = searchParams.get("direction") as BuildSortDirection | null;
    const sort = sortParam && ALLOWED_SORTS.includes(sortParam) ? sortParam : undefined;
    const direction = directionParam && ALLOWED_DIRECTIONS.includes(directionParam) ? directionParam : undefined;
    const start = Number(searchParams.get("start") || 0);
    const size = Number(searchParams.get("size") || 48);
    const data = await getAllBuilds({
      category: category ? (category as BuildCategory) : undefined,
      type: type ? (type as BuildType) : undefined,
      nameSearch: nameSearch || undefined,
      sort,
      direction,
      start,
      size,
    });

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching all builds:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
