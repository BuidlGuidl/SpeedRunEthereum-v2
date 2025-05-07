import { useQuery } from "@tanstack/react-query";
import { fetchBatchNameList } from "~~/services/api/batches";

export const useBatchList = () => {
  return useQuery({ queryKey: ["batches-list"], queryFn: fetchBatchNameList });
};
