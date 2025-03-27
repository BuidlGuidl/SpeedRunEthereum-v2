"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import { Address } from "~~/components/scaffold-eth";
import { ActivityItem, ActivityResponse, ActivityType, getActivities } from "~~/services/api/activities";
import { ReviewAction } from "~~/services/database/config/types";

const FETCH_SIZE = 20;
const ROW_HEIGHT_IN_PX = 65;

export default function ActivityPage() {
  // we need a reference to the scrolling element for logic down below
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [activityType, setActivityType] = useState<ActivityType>("ALL");

  const columns = useMemo<ColumnDef<ActivityItem>[]>(
    () => [
      {
        header: "BUILDER",
        size: 300,
        cell: info => {
          const row = info.row.original;
          return <Address address={row.userAddress} />;
        },
      },
      {
        header: "TIME",
        size: 200,
        cell: info => {
          return (
            <div className="flex w-full justify-center">
              <DateWithTooltip timestamp={info.row.original.timestamp} position="left" />
            </div>
          );
        },
      },
      {
        header: "ACTION",
        size: 500,
        cell: info => {
          const item = info.row.original;
          const { details } = item;
          const type = item.type;

          if (type === "USER_CREATE") {
            return <div className="text-left">just created a builder account. Welcome!</div>;
          } else if (type === "CHALLENGE_SUBMISSIONS") {
            if (details.reviewAction) {
              return (
                <div className="text-left">
                  The submitted &ldquo;{details.challengeName}&rdquo; challenge has been{" "}
                  <span
                    className={`${details.reviewAction === ReviewAction.ACCEPTED ? "text-primary font-semibold" : details.reviewAction === ReviewAction.REJECTED ? "text-error" : "text-warning"}`}
                  >
                    {details.reviewAction.toLowerCase()}
                  </span>
                </div>
              );
            } else {
              return <div className="text-left">submitted a solution for {details.challengeName}</div>;
            }
          }

          return <div className="text-left">Activity recorded</div>;
        },
      },
    ],
    [],
  );

  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<ActivityResponse>({
    queryKey: ["activities", activityType],
    queryFn: async ({ pageParam = 0 }) => {
      const start = (pageParam as number) * FETCH_SIZE;
      const fetchedData = await getActivities(start, FETCH_SIZE, activityType);
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

  // Reset the table when the activity type changes
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [activityType]);

  const tableData = useMemo(() => (isLoading ? Array(10).fill({}) : flatData), [isLoading, flatData]);

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
    getCoreRowModel: getCoreRowModel(),
  });

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

  const handleActivityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActivityType(e.target.value as ActivityType);
  };

  return (
    <div className="mx-4 text-center">
      <h2 className="mt-10 mb-0 text-3xl">Activity Feed</h2>
      <div className="text-base mt-2">Latest activities on SRE</div>

      <div className="mt-4 w-full max-w-lg mx-auto">
        <select
          className="select select-bordered w-full max-w-xs mx-auto"
          value={activityType}
          onChange={handleActivityTypeChange}
        >
          <option value="ALL">All</option>
          <option value="CHALLENGE_SUBMISSIONS">Challenge Submissions</option>
          <option value="USER_CREATE">New Builders</option>
        </select>
      </div>
      <div
        onScroll={e => fetchMoreOnBottomReached(e.currentTarget)}
        ref={tableContainerRef}
        style={{
          // 32 is to prevent horizontal scrollbar from appearing
          maxWidth: `${columns.reduce((acc, col) => acc + (col.size ?? 0), 32)}px`,
        }}
        // needed fixed height to prevent layout shift
        className="mt-4 relative overflow-auto shadow-lg rounded-lg mx-auto h-[calc(100vh-404px)] lg:h-[calc(100vh-340px)]"
      >
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <table style={{ display: "grid" }} className="table bg-base-100">
          <thead className="grid sticky bg-base-100 top-0 z-10">
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
                      <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
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
              const row = rows[virtualRow.index];
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
      {isFetching && <div className="mt-2">Fetching more...</div>}
    </div>
  );
}
