"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import EmailIcon from "../_assets/icons/EmailIcon";
import GithubIcon from "../_assets/icons/GithubIcon";
import InstagramIcon from "../_assets/icons/IntagramIcon";
import TelegramIcon from "../_assets/icons/TelegramIcon";
import XIcon from "../_assets/icons/XIcon";
import { CopyDiscordToClipboard } from "./_component/CopyDiscordToClipboard";
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
import { Address } from "~~/components/scaffold-eth";
import { getSortedUsersWithChallenges } from "~~/services/api/users";
import { UserWithChallengesData } from "~~/services/database/repositories/users";

export type UsersApiResponse = {
  data: UserWithChallengesData[];
  meta: {
    totalRowCount: number;
  };
};

const FETCH_SIZE = 20;
const ROW_HEIGHT_IN_PX = 50;

export default function BuildersPage() {
  // we need a reference to the scrolling element for logic down below
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<UserWithChallengesData>[]>(
    () => [
      {
        accessorKey: "userAddress",
        header: "Builder",
        size: 200,
        cell: info => {
          const row = info.row.original;

          return <Address address={row.userAddress} />;
        },
      },
      {
        header: "Challenges",
        accessorKey: "challengesCompleted",
        cell: info => info.getValue(),
        size: 100,
      },
      {
        header: "Socials",
        size: 200,
        cell: info => {
          const row = info.row.original;

          return (
            <div className="flex gap-2">
              {row.socialTelegram && (
                <Link href={`https://t.me/${row.socialTelegram}`}>
                  <TelegramIcon className="w-4 h-4 fill-primary" />
                </Link>
              )}
              {row.socialX && (
                <Link href={`https://x.com/${row.socialX}`}>
                  <XIcon className="w-4 h-4 fill-primary" />
                </Link>
              )}
              {row.socialGithub && (
                <Link href={`https://github.com/${row.socialGithub}`}>
                  <GithubIcon className="w-4 h-4 fill-primary" />
                </Link>
              )}
              {row.socialInstagram && (
                <Link href={`https://instagram.com/${row.socialInstagram}`}>
                  <InstagramIcon className="w-4 h-4 fill-primary" />
                </Link>
              )}
              {row.socialDiscord && <CopyDiscordToClipboard text={row.socialDiscord} />}
              {row.socialEmail && (
                <Link href={`mailto:${row.socialEmail}`}>
                  <EmailIcon className="w-4 h-4 fill-primary" />
                </Link>
              )}
            </div>
          );
        },
      },
      {
        header: "Last Activity",
        accessorKey: "lastActivity",
        cell: info => {
          const row = info.row.original;

          const date = row.lastActivity || (row.createdAt as Date);
          return new Date(date).toLocaleString();
        },
        size: 200,
      },
    ],
    [],
  );

  // react-query has a useInfiniteQuery hook that is perfect for this use case
  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<UsersApiResponse>({
    queryKey: [
      "users",
      sorting, // refetch when sorting changes
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const start = (pageParam as number) * FETCH_SIZE;
      const fetchedData = await getSortedUsersWithChallenges(start, FETCH_SIZE, sorting); // pretend api call
      return fetchedData;
    },
    initialPageParam: 0,
    getNextPageParam: (_lastGroup, groups) => groups.length,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // flatten the array of arrays from the useInfiniteQuery hook
  const flatData = useMemo(() => data?.pages?.flatMap(page => page.data) ?? [], [data]);
  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  // called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        // once the user has scrolled within ROW_HEIGHT_IN_PX px of the bottom of the table, fetch more data if we can
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

  const table = useReactTable({
    data: flatData,
    columns,
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

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <div className="mx-4 text-center">
      <h2 className="mt-10 mb-0 text-3xl">All Builders</h2>
      <div className="text-base mt-4">
        List of Ethereum builders creating products, prototypes, and tutorials with{" "}
        <Link href="https://github.com/scaffold-eth/scaffold-eth-2" className="underline">
          Scaffold-ETH 2
        </Link>
      </div>

      <div className="text-base mt-4 font-medium">Total builders: {totalDBRowCount}</div>
      <div
        onScroll={e => fetchMoreOnBottomReached(e.currentTarget)}
        ref={tableContainerRef}
        style={{
          overflow: "auto", // our scrollable table container
          position: "relative", // needed for sticky header
          // 4 is 2 * border-2
          maxWidth: `${columns.reduce((acc, col) => acc + (col.size ?? 0), 4)}px`,
        }}
        // needed fixed height to prevent layout shift
        className="mt-4 border-2 border-base-300 rounded-lg mx-auto h-[calc(100vh-404px)] lg:h-[calc(100vh-340px)]"
      >
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <table style={{ display: "grid" }} className="table table-zebra bg-base-100">
          <thead
            style={{
              display: "grid",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
            className="bg-base-300"
          >
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} style={{ display: "flex", width: "100%" }}>
                {headerGroup.headers.map(header => {
                  return (
                    <th
                      key={header.id}
                      style={{
                        display: "flex",
                        width: header.getSize(),
                      }}
                    >
                      <div
                        {...{
                          className: header.column.getCanSort() ? "cursor-pointer select-none" : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
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
              display: "grid",
              height: `${rowVirtualizer.getTotalSize()}px`, // tells scrollbar how big the table is
              position: "relative", // needed for absolute positioning of rows
            }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const row = rows[virtualRow.index] as Row<UserWithChallengesData>;
              return (
                <tr
                  data-index={virtualRow.index} // needed for dynamic row height measurement
                  ref={node => rowVirtualizer.measureElement(node)} // measure dynamic row height
                  key={row.id}
                  style={{
                    display: "flex",
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`, // this should always be a `style` as it changes on scroll
                    width: "100%",
                    height: `${ROW_HEIGHT_IN_PX}px`,
                  }}
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
