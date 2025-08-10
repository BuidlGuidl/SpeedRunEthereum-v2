import { NextRequest, NextResponse } from "next/server";
import { getBuildByBuildId, updateBuildGrantFlag } from "~~/services/database/repositories/builds";

type GrantCompletedPayload = {
  apiKey?: string;
  buildId?: string;
};

export async function POST(request: NextRequest) {
  let payload: GrantCompletedPayload;
  try {
    payload = (await request.json()) as GrantCompletedPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { apiKey, buildId } = payload;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing apiKey" }, { status: 400 });
  }

  if (apiKey !== process.env.SRE_API_KEY) {
    return NextResponse.json({ error: "Invalid apiKey" }, { status: 401 });
  }

  if (!buildId) {
    return NextResponse.json({ error: "Missing buildId" }, { status: 400 });
  }

  try {
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
