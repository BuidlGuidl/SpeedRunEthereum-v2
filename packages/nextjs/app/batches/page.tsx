"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TelegramIcon from "../_assets/icons/TelegramIcon";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  OnChangeFn,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import { getSortedBatches } from "~~/services/api/batches";
import { BatchStatus } from "~~/services/database/config/types";
import { Batch } from "~~/services/database/repositories/batches";

export type BatchesApiResponse = {
  data: Batch[];
  meta: {
    totalRowCount: number;
  };
};

const FETCH_SIZE = 20;
const ROW_HEIGHT_IN_PX = 65;

export default function BuildersPage() {
  // we need a reference to the scrolling element for logic down below
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableHeader = useRef<HTMLTableSectionElement>(null);

  const [sorting, setSorting] = useState<SortingState>([{ id: "startDate", desc: true }]);

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

  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<BatchesApiResponse>({
    queryKey: ["batches", sorting],
    queryFn: async ({ pageParam = 0 }) => {
      const start = (pageParam as number) * FETCH_SIZE;
      const fetchedData = await getSortedBatches(start, FETCH_SIZE, sorting);
      return fetchedData;
    },
    initialPageParam: 0,
    getNextPageParam: (_lastGroup, groups) => groups.length,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const flatData = useMemo(() => data?.pages?.flatMap(page => page.data) ?? [], [data]);
  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        if (
          scrollHeight - scrollTop - clientHeight < ROW_HEIGHT_IN_PX &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
  );

  // a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const tableData = useMemo(() => (isLoading ? Array(30).fill({}) : flatData), [isLoading, flatData]);

  const tableColumns = useMemo(
    () =>
      isLoading
        ? columns.map(column => ({
            ...column,
            cell: () => <div className="skeleton h-4 w-full bg-accent" />,
          }))
        : columns,
    [isLoading, columns],
  );

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  });

  // scroll to top of table when sorting changes
  const handleSortingChange: OnChangeFn<SortingState> = updater => {
    setSorting(updater);
    if (!!table.getRowModel().rows.length) {
      rowVirtualizer.scrollToIndex?.(0);
    }
  };

  // since this table option is derived from table row model state, we're using the table.setOptions utility
  table.setOptions(prev => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }));

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT_IN_PX, // estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    // measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <div className="mx-4 text-center">
      <div className="text-base mt-4 font-medium">Total batches: {totalDBRowCount}</div>
      <div
        onScroll={e => fetchMoreOnBottomReached(e.currentTarget)}
        ref={tableContainerRef}
        className="mt-4 relative overflow-auto shadow-lg rounded-lg mx-auto"
        style={{
          // 32 is to prevent horizontal scrollbar from appearing
          maxWidth: `${columns.reduce((acc, col) => acc + (col.size ?? 0), 32)}px`,
          // needed fixed height to prevent layout shift
          height: `min(calc(100vh - 404px), calc(${ROW_HEIGHT_IN_PX}px * ${totalDBRowCount} + ${tableHeader.current?.offsetHeight ?? 0}px))`,
        }}
      >
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <table style={{ display: "grid" }} className="table bg-base-100">
          <thead className="grid sticky bg-base-100 top-0 z-10" ref={tableHeader}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="flex w-full text-sm">
                {headerGroup.headers.map(header => {
                  return (
                    <th
                      key={header.id}
                      style={{
                        width: header.getSize(),
                      }}
                      className="flex justify-center uppercase first:justify-start"
                    >
                      <div
                        onClick={header.column.getToggleSortingHandler()}
                        className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`, // tells scrollbar how big the table is
              position: "relative", // needed for absolute positioning of rows
            }}
            className="grid"
          >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const row = rows[virtualRow.index] as Row<Batch>;
              return (
                <tr
                  data-index={virtualRow.index} // needed for dynamic row height measurement
                  ref={node => rowVirtualizer.measureElement(node)} // measure dynamic row height
                  key={row.id}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`, // this should always be a `style` as it changes on scroll
                    height: `${ROW_HEIGHT_IN_PX}px`,
                  }}
                  className="flex absolute w-full hover"
                >
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                        }}
                        className="flex items-center"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isFetching && <div>Fetching More...</div>}
    </div>
  );
}
