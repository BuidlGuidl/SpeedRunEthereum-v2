import { useQuery } from "@tanstack/react-query";
import { fetchLatestOpenBatch } from "~~/services/api/batches";

export const useLatestOpenBatch = () => {
  return useQuery({ queryKey: ["latest-open-batch"], queryFn: fetchLatestOpenBatch });
};
