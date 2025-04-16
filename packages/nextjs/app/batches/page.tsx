"use client";

import { useMemo, useState } from "react";
import SearchIcon from "../_assets/icons/SearchIcon";
import TelegramIcon from "../_assets/icons/TelegramIcon";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import InfiniteTable from "~~/components/InfiniteTable";
import { InputBase } from "~~/components/scaffold-eth";
import { getSortedBatches } from "~~/services/api/batches";
import { BatchStatus } from "~~/services/database/config/types";
import { BatchWithCounts } from "~~/services/database/repositories/batches";

export default function BuildersPage() {
  const [filter, setFilter] = useState("");

  const { data: batches } = useQuery({
    queryKey: ["batches-count"],
    queryFn: () => getSortedBatches(0, 0, []),
  });

  const columns = useMemo<ColumnDef<BatchWithCounts>[]>(
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
        header: "Graduates / Participants",
        accessorKey: "graduateCount",
        enableSorting: true,
        cell: info => {
          const row = info.row.original;

          const graduates = row.graduateCount || 0;
          const candidates = row.candidateCount || 0;

          return (
            <div className="flex w-full justify-center">
              {graduates} / {graduates + candidates}
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

      <div className="flex items-center justify-center max-w-md mt-4 mx-auto">
        <InputBase
          name="filter"
          value={filter}
          onChange={setFilter}
          placeholder="Search for batch"
          suffix={<SearchIcon className="w-7 h-6 pr-2 fill-primary/60 self-center" />}
        />
      </div>

      <InfiniteTable<BatchWithCounts>
        columns={columns}
        queryKey={"batches"}
        queryFn={getSortedBatches}
        initialSorting={useMemo(() => [{ id: "startDate", desc: true }], [])}
        filter={filter}
      />
    </div>
  );
}
