import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const path = request.nextUrl.searchParams.get("path");
    const tag = request.nextUrl.searchParams.get("tag");

    if (!token || token !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json({ revalidated: false, message: "Invalid token" }, { status: 401 });
    }

    if (!path && !tag) {
      return NextResponse.json({ revalidated: false, message: "Path or tag is required" }, { status: 400 });
    }

    if (path) revalidatePath(path);
    if (tag) revalidateTag(tag);

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ revalidated: false, message: "Error revalidating" }, { status: 500 });
  }
}
