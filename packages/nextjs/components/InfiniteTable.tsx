"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKey, keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
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

const DEFAULT_FETCH_SIZE = 20;
const DEFAULT_ROW_HEIGHT_IN_PX = 65;

type InfiniteTableApiResponse<T> = {
  data: T[];
  meta: {
    totalRowCount: number;
  };
};

type InfiniteTableProps<T> = {
  columns: ColumnDef<T>[];
  queryKey: QueryKey;
  queryFn: (
    pageParam: number,
    fetchSize: number,
    sorting: SortingState,
    filter?: string,
  ) => Promise<InfiniteTableApiResponse<T>>;
  fetchSize?: number;
  rowHeightInPx?: number;
  initialSorting?: SortingState;
  filter?: string;
};

export default function InfiniteTable<T>({
  columns,
  queryKey,
  queryFn,
  fetchSize = DEFAULT_FETCH_SIZE,
  rowHeightInPx = DEFAULT_ROW_HEIGHT_IN_PX,
  initialSorting = [],
  filter = "",
}: InfiniteTableProps<T>) {
  // we need a reference to the scrolling element for logic down below
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableHeader = useRef<HTMLTableSectionElement>(null);

  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<InfiniteTableApiResponse<T>>({
    queryKey: [...queryKey, sorting, filter],
    queryFn: async ({ pageParam = 0 }) => {
      const start = (pageParam as number) * fetchSize;
      const fetchedData = await queryFn(start, fetchSize, sorting, filter);
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
        if (scrollHeight - scrollTop - clientHeight < rowHeightInPx && !isFetching && totalFetched < totalDBRowCount) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount, rowHeightInPx],
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
    estimateSize: () => rowHeightInPx, // estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    // measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <>
      <div
        onScroll={e => fetchMoreOnBottomReached(e.currentTarget)}
        ref={tableContainerRef}
        className="mt-4 relative overflow-auto shadow-lg rounded-lg mx-auto"
        style={{
          // 32 is to prevent horizontal scrollbar from appearing
          maxWidth: `${columns.reduce((acc, col) => acc + (col.size ?? 0), 32)}px`,
          // needed fixed height to prevent layout shift
          height: `min(calc(100vh - 404px), calc(${rowHeightInPx}px * ${totalDBRowCount} + ${tableHeader.current?.offsetHeight ?? 0}px))`,
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
              const row = rows[virtualRow.index] as Row<T>;
              return (
                <tr
                  data-index={virtualRow.index} // needed for dynamic row height measurement
                  ref={node => rowVirtualizer.measureElement(node)} // measure dynamic row height
                  key={row.id}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`, // this should always be a `style` as it changes on scroll
                    height: `${rowHeightInPx}px`,
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
      {isFetching && <div>Fetching data...</div>}
    </>
  );
}
