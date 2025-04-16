"use client";

import { useMemo } from "react";
import TelegramIcon from "../_assets/icons/TelegramIcon";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import InfiniteTable from "~~/components/InfiniteTable";
import { getSortedBatches } from "~~/services/api/batches";
import { BatchStatus } from "~~/services/database/config/types";
import { Batch } from "~~/services/database/repositories/batches";

export default function BuildersPage() {
  const { data: batches } = useQuery({
    queryKey: ["batches-count"],
    queryFn: () => getSortedBatches(0, 0, []),
  });

  const columns = useMemo<ColumnDef<Batch>[]>(
    () => [
      {
        header: "Batch",
        size: 200,
        cell: info => {
          const row = info.row.original;

          // TODO: update
          return <div className="flex w-full justify-center">{row?.name}</div>;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: info => {
          const status = info.getValue() as string;

          return (
            <div
              className={`flex w-full justify-center ${status === BatchStatus.OPEN ? "text-green-500" : "text-primary/60"}`}
            >
              {status}
            </div>
          );
        },
        size: 200,
      },
      {
        header: "Start Date",
        accessorKey: "startDate",
        cell: info => {
          return (
            <div className="flex w-full justify-center">
              <DateWithTooltip timestamp={info.getValue() as Date} position="left" />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Links",
        size: 200,
        cell: info => {
          const batch = info.row.original;

          const telegramLink = batch?.telegramLink;

          return (
            <div className="flex w-full items-center justify-center gap-2">
              {telegramLink && (
                <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="link">
                  <TelegramIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="mx-4 text-center">
      <div className="text-base mt-4 font-medium">Total batches: {batches?.meta.totalRowCount ?? "Loading..."}</div>
      <InfiniteTable<Batch>
        columns={columns}
        queryKey={"batches"}
        queryFn={getSortedBatches}
        initialSorting={useMemo(() => [{ id: "startDate", desc: true }], [])}
      />
    </div>
  );
}
