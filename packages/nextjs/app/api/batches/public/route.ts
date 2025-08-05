import { Batch, getAllBatchesDataWithCounts } from "~~/services/database/repositories/batches";

export async function GET() {
  try {
    const allBatchData = await getAllBatchesDataWithCounts();
    const batches = allBatchData.map((batch: Batch) => ({
      ...batch,
      telegramLink: undefined,
    }));

    return Response.json(batches);
  } catch (error) {
    console.error("Error fetching sorted batches:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
