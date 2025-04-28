"use client";

import { useMemo, useState } from "react";
import { ADD_BATCH_MODAL_ID, AddBatchModal } from "./_components/AddBatchModal";
import { UPDATE_BATCH_MODAL_ID, UpdateBatchModal } from "./_components/UpdateBatchModal";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useDebounceValue } from "usehooks-ts";
import { useAccount } from "wagmi";
import EditIcon from "~~/app/_assets/icons/EditIcon";
import EthereumIcon from "~~/app/_assets/icons/EthereumIcon";
import GithubIcon from "~~/app/_assets/icons/GithubIcon";
import SearchIcon from "~~/app/_assets/icons/SearchIcon";
import TelegramIcon from "~~/app/_assets/icons/TelegramIcon";
import WebsiteIcon from "~~/app/_assets/icons/WebsiteIcon";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import InfiniteTable from "~~/components/InfiniteTable";
import { InputBase } from "~~/components/scaffold-eth";
import { useUser } from "~~/hooks/useUser";
import { getSortedBatches } from "~~/services/api/batches";
import { BatchStatus, UserRole } from "~~/services/database/config/types";
import { BatchWithCounts } from "~~/services/database/repositories/batches";

export default function BatchesPage() {
  const { address: connectedAddress } = useAccount();
  const { data: user } = useUser(connectedAddress);

  const [filter, setFilter] = useState("");
  const [batchesUpdatesCount, setBatchesUpdatesCount] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState<BatchWithCounts | null>(null);
  const refreshQueries = () => {
    setBatchesUpdatesCount(prev => prev + 1);
  };

  const [debouncedFilter] = useDebounceValue(filter, 500);

  const { data: batches } = useQuery({
    queryKey: ["batches-count", batchesUpdatesCount],
    queryFn: () => getSortedBatches({ start: 0, size: 0, sorting: [] }),
  });

  const tableQueryKey = useMemo(
    () => ["batches", debouncedFilter, batchesUpdatesCount],
    [debouncedFilter, batchesUpdatesCount],
  );
  const tableInitialSorting = useMemo(() => [{ id: "startDate", desc: true }], []);

  const columns = useMemo<ColumnDef<BatchWithCounts>[]>(
    () => [
      {
        header: "Batch",
        accessorKey: "name",
        size: 200,
        cell: info => {
          const row = info.row.original;

          return (
            <div
              className={`flex rounded-sm px-2 py-0.5 font-semibold ${row.status === BatchStatus.OPEN ? "bg-green-500/30" : ""}`}
            >
              {(info.getValue() as string).toUpperCase()}
            </div>
          );
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

          const { telegramLink, contractAddress, bgSubdomain } = batch;

          return (
            <div className="flex w-full items-center justify-center gap-3">
              {contractAddress && (
                <a
                  href={`https://optimistic.etherscan.io/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  <EthereumIcon className="w-4 h-4" />
                </a>
              )}

              <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="link">
                <TelegramIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://${bgSubdomain}.buidlguidl.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                <WebsiteIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://github.com/BuidlGuidl/${bgSubdomain}.buidlguidl.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          );
        },
      },
      {
        header: "Edit",
        size: 200,
        cell: info => {
          const batch = info.row.original;
          return (
            <div className="flex w-full justify-center">
              <label
                htmlFor={UPDATE_BATCH_MODAL_ID}
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setSelectedBatch(batch)}
              >
                <EditIcon className="w-4 h-4" />
              </label>
            </div>
          );
        },
      },
    ],
    [],
  );

  // TODO: update this logic later
  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <div className="mx-4 text-center">
      <div className="text-base mt-4 font-medium">Total batches: {batches?.meta.totalRowCount ?? "Loading..."}</div>

      <div className="flex items-center justify-center max-w-md mt-4 mx-auto gap-2">
        <InputBase
          name="filter"
          value={filter}
          onChange={setFilter}
          placeholder="Search for batch"
          suffix={<SearchIcon className="w-7 h-6 pr-2 fill-primary/60 self-center" />}
        />
        <label htmlFor={ADD_BATCH_MODAL_ID} className="btn btn-primary h-[40px] min-h-[40px]">
          + Add Batch
        </label>
      </div>

      <InfiniteTable<BatchWithCounts>
        columns={columns}
        queryKey={tableQueryKey}
        queryFn={({ start, fetchSize, sorting }) =>
          getSortedBatches({ start, size: fetchSize, sorting, filter: debouncedFilter })
        }
        initialSorting={tableInitialSorting}
      />

      <AddBatchModal refreshQueries={refreshQueries} />
      {selectedBatch && (
        <UpdateBatchModal
          batchId={selectedBatch.id.toString()}
          defaultName={selectedBatch.name}
          defaultStatus={selectedBatch.status}
          defaultStartDate={new Date(selectedBatch.startDate)}
          defaultTelegramLink={selectedBatch.telegramLink}
          defaultRegistryAddress={selectedBatch.contractAddress || ""}
          refreshQueries={refreshQueries}
          setSelectedBatch={setSelectedBatch}
        />
      )}
    </div>
  );
}
