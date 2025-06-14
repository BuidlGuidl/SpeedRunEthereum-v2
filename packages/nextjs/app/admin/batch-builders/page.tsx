"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { useDebounceValue } from "usehooks-ts";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import EditIcon from "~~/app/_assets/icons/EditIcon";
import SearchIcon from "~~/app/_assets/icons/SearchIcon";
import { UPDATE_USER_MODAL_ID, UpdateUserModal } from "~~/app/_components/UpdateUserModal";
import { CopyValueToClipboard } from "~~/components/CopyValueToClipboard";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import InfiniteTable from "~~/components/InfiniteTable";
import { Address, InputBase } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useBatchList } from "~~/hooks/useBatchList";
import { getSortedBatchBuilders } from "~~/services/api/users";
import { BatchUserStatus } from "~~/services/database/config/types";
import { BatchBuilder } from "~~/services/database/repositories/users";
import { getUserSocialsList } from "~~/utils/socials";

const ALL_BATCHES_TEXT = "All batches";

export default function BatchBuildersPage() {
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const { data: builders, isLoading } = useQuery({
    queryKey: ["builders-count"],
    queryFn: () => getSortedBatchBuilders({ start: 0, size: 0, sorting: [] }),
  });

  const { data: batches } = useBatchList();

  const [filter, setFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<number>();
  const [builderToEdit, setBuilderToEdit] = useState<BatchBuilder>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [debouncedFilter] = useDebounceValue(filter, 500);

  const closeDropdown = () => {
    dropdownRef.current?.removeAttribute("open");
  };

  useOutsideClick(dropdownRef, closeDropdown);

  const handleBatchSelect = (batchId?: number) => {
    setSelectedBatchId(batchId);
    closeDropdown();
  };

  const tableQueryKey = useMemo(
    () => ["batch-builders", debouncedFilter, selectedBatchId, refreshTrigger],
    [debouncedFilter, refreshTrigger, selectedBatchId],
  );

  const tableInitialSorting = useMemo(() => [{ id: "batch_start", desc: true }], []);

  const columns = useMemo<ColumnDef<BatchBuilder>[]>(
    () => [
      {
        header: "Builder",
        size: 200,
        cell: info => {
          const row = info.row.original;

          return <Address address={row.userAddress} cachedEns={row.ens} />;
        },
      },
      {
        header: "Batch",
        size: 200,
        accessorKey: "batch.start",
        cell: info => {
          const row = info.row.original;

          return (
            <div className="flex w-full justify-center items-center">
              <div
                className={`rounded-sm px-2 py-0.5 font-semibold ${
                  row.batchStatus === BatchUserStatus.GRADUATE
                    ? "bg-green-500/30"
                    : "text-yellow-600 dark:text-yellow-400 bg-warning/30"
                }`}
              >
                {row.batch?.name.toString().toUpperCase()}
              </div>
            </div>
          );
        },
      },
      {
        header: "Socials",
        size: 200,
        cell: info => {
          const user = info.row.original;

          const userSocials = getUserSocialsList(user);

          return (
            <div className="flex w-full items-center justify-center gap-2">
              {userSocials
                .filter(social => social.value)
                .map(social => {
                  const link = social.getLink?.(social.value as string);
                  return (
                    <div key={social.key} className="flex items-center">
                      {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer" className="link">
                          <social.icon className="w-4 h-4" />
                        </a>
                      ) : (
                        <CopyValueToClipboard text={social.value as string} Icon={social.icon} position="left" />
                      )}
                    </div>
                  );
                })}
            </div>
          );
        },
      },
      {
        header: "User created",
        accessorKey: "createdAt",
        cell: info => {
          return (
            <div className="flex w-full justify-center">
              <DateWithTooltip timestamp={info.getValue() as Date} position="left" />
            </div>
          );
        },
        size: 200,
      },
      {
        header: "Edit",
        size: 200,
        cell: (info: CellContext<BatchBuilder, unknown>) => {
          const builder = info.row.original;
          return (
            <div className="flex w-full justify-center">
              <label
                htmlFor={UPDATE_USER_MODAL_ID}
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setBuilderToEdit(builder)}
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

  return (
    <div className="mx-4 text-center">
      <div className="text-base mt-8 font-medium flex justify-center gap-1">
        <span>Total Builders:</span>
        {isLoading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <span>{builders?.meta.totalRowCount ?? 0}</span>
        )}
      </div>
      <div className="flex items-center justify-center max-w-md mt-4 mx-auto gap-2 mb-8">
        <InputBase
          name="filter"
          value={filter}
          onChange={setFilter}
          placeholder="Search builder"
          suffix={<SearchIcon className="w-7 h-6 pr-2 fill-primary/60 self-center" />}
        />
        <details ref={dropdownRef} className="dropdown">
          <summary className="btn btn-primary h-10 min-h-10">
            {selectedBatchId ? batches?.find(batch => batch.id === selectedBatchId)?.name : ALL_BATCHES_TEXT}
            <ChevronDownIcon className="h-6 w-4" />
          </summary>
          <ul className="dropdown-content menu mt-2 bg-base-100 rounded-box z-20 w-52 p-2 shadow flex-nowrap max-h-64 overflow-y-auto">
            <li>
              <div className="!p-0 mb-1">
                <InputBase
                  name="batch-filter"
                  value={batchFilter}
                  onChange={setBatchFilter}
                  placeholder="Search batch"
                  suffix={<SearchIcon className="w-7 h-6 pr-2 fill-primary/60 self-center" />}
                />
              </div>
            </li>
            {ALL_BATCHES_TEXT.toLowerCase().includes(batchFilter.toLowerCase()) && (
              <li>
                <button onClick={() => handleBatchSelect(undefined)} className="w-full text-left">
                  {ALL_BATCHES_TEXT}
                </button>
              </li>
            )}
            {batches
              ?.filter(batch => batch.name.toLowerCase().includes(batchFilter.toLowerCase()))
              .map(batch => (
                <li key={batch.id}>
                  <button onClick={() => handleBatchSelect(batch.id)} className="w-full text-left">
                    {batch.name}
                  </button>
                </li>
              ))}
          </ul>
        </details>
      </div>
      {builderToEdit && (
        <UpdateUserModal
          user={builderToEdit}
          onSuccess={() => {
            setRefreshTrigger(prev => prev + 1);
            setBuilderToEdit(undefined);
          }}
        />
      )}
      <InfiniteTable<BatchBuilder>
        columns={columns}
        queryKey={tableQueryKey}
        queryFn={({ start, size, sorting }) =>
          getSortedBatchBuilders({
            start,
            size,
            sorting,
            filter: debouncedFilter,
            batchId: selectedBatchId,
          })
        }
        initialSorting={tableInitialSorting}
      />
    </div>
  );
}
