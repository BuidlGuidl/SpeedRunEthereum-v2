import { useQuery } from "@tanstack/react-query";
import { getBatchNameList } from "~~/services/api/batches";

export const useBatchList = () => {
  return useQuery({ queryKey: ["batches-list"], queryFn: getBatchNameList });
};
