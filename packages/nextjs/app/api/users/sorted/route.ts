import { NextRequest } from "next/server";
import { getSortedUsersWithChallenges } from "~~/services/database/repositories/users";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start = parseInt(searchParams.get("start") ?? "0");
    const size = parseInt(searchParams.get("size") ?? "0");
    const sorting = JSON.parse(searchParams.get("sorting") ?? "[]");

    const data = await getSortedUsersWithChallenges(start, size, sorting);

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching sorted users:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
