import { NextRequest } from "next/server";
import { getAllBuilds } from "~~/services/database/repositories/builds";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nameSearch = searchParams.get("name");
    const data = await getAllBuilds({ nameSearch: nameSearch || "" });

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching all builds:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
