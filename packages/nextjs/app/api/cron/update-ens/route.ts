import { NextResponse } from "next/server";
import { updateEnsNames } from "~~/services/cron/updateEns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await updateEnsNames();

    return new NextResponse("ENS update completed successfully", { status: 200 });
  } catch (error) {
    console.error("Error in ENS update endpoint:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
