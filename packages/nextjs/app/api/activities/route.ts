import { NextRequest, NextResponse } from "next/server";
import { ActivityType } from "~~/services/api/activities";
import { getActivities } from "~~/services/database/repositories/activities";
import { isAdminSession } from "~~/utils/auth";

export async function GET(request: NextRequest) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const start = Number(searchParams.get("start") || 0);
  const size = Number(searchParams.get("size") || 20);
  const type = (searchParams.get("type") as ActivityType) || "ALL";

  try {
    const activities = await getActivities(start, size, type);
    return NextResponse.json(activities);
  } catch (error: any) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch activities" }, { status: 500 });
  }
}
