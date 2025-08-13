import { NextRequest, NextResponse } from "next/server";
import { getBuildByBuildId, updateBuildGrantFlag } from "~~/services/database/repositories/builds";

type GrantCompletedPayload = {
  apiKey?: string;
  buildId?: string;
};

export async function POST(request: NextRequest) {
  try {
    const payload: GrantCompletedPayload = await request.json();
    const { apiKey, buildId } = payload;

    if (!apiKey || apiKey !== process.env.SRE_API_KEY) {
      return NextResponse.json({ error: "Invalid apiKey" }, { status: 401 });
    }

    if (!buildId) {
      return NextResponse.json({ error: "Missing buildId" }, { status: 400 });
    }

    const build = await getBuildByBuildId(buildId);
    if (!build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    await updateBuildGrantFlag(buildId, true);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
