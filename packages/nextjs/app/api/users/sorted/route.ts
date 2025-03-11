import { NextRequest } from "next/server";
import { SortingState } from "@tanstack/react-table";
import { findSortedUsersGroup } from "~~/services/database/repositories/users";

const DEFAULT_SEARCH_START = "0";
const DEFAULT_SEARCH_SIZE = "10";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const start = parseInt(searchParams.get("start") ?? DEFAULT_SEARCH_START);
  const size = parseInt(searchParams.get("size") ?? DEFAULT_SEARCH_SIZE);
  const sorting = JSON.parse(searchParams.get("sorting") ?? "[]");

  const data = await findSortedUsersGroup(start, size, sorting);

  return Response.json(data);
}
