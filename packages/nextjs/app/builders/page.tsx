"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useDebounceValue } from "usehooks-ts";
import SearchIcon from "~~/app/_assets/icons/SearchIcon";
import { CopyValueToClipboard } from "~~/components/CopyValueToClipboard";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import InfiniteTable from "~~/components/InfiniteTable";
import { Address, InputBase } from "~~/components/scaffold-eth";
import { getSortedUsersWithChallenges } from "~~/services/api/users";
import { UserWithChallengesData } from "~~/services/database/repositories/users";
import { getUserSocialsList } from "~~/utils/socials";

export default function BuildersPage() {
  const [filter, setFilter] = useState("");

  const [debouncedFilter] = useDebounceValue(filter.length >= 3 ? filter : "", 500);

  const { data: builders, isLoading } = useQuery({
    queryKey: ["builders-count"],
    queryFn: () => getSortedUsersWithChallenges({ start: 0, size: 0, sorting: [] }),
  });

  const tableQueryKey = useMemo(() => ["users", debouncedFilter], [debouncedFilter]);
  const tableInitialSorting = useMemo(() => [{ id: "lastActivity", desc: true }], []);

  const columns = useMemo<ColumnDef<UserWithChallengesData>[]>(
    () => [
      {
        header: "Builder",
        size: 200,
        cell: info => {
          const row = info.row.original;

          return <Address address={row.userAddress} cachedEns={row.ens} cachedEnsAvatar={row.ensAvatar} />;
        },
      },
      {
        header: "Challenges",
        accessorKey: "challengesCompleted",
        cell: info => <div className="flex w-full justify-center">{info.getValue() as string}</div>,
        size: 200,
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
        header: "Last Activity",
        accessorKey: "lastActivity",
        cell: info => {
          return (
            <div className="flex w-full justify-center">
              <DateWithTooltip timestamp={info.getValue() as Date} position="left" />
            </div>
          );
        },
        size: 300,
      },
    ],
    [],
  );

  const emptyMessage = debouncedFilter
    ? `No builders found matching "${debouncedFilter}". Try a different search term.`
    : "No builders found";

  return (
    <div className="mx-4 text-center">
      <h2 className="mt-10 mb-0 text-3xl">All Builders</h2>
      <div className="text-base mt-4">
        List of Ethereum builders creating products, prototypes, and tutorials with{" "}
        <Link href="https://github.com/scaffold-eth/scaffold-eth-2" className="underline">
          Scaffold-ETH 2
        </Link>
      </div>

      <div className="text-base mt-4 font-medium flex justify-center gap-1">
        <span>Total Builders:</span>
        {isLoading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <span>{builders?.meta.totalRowCount ?? 0}</span>
        )}
      </div>

      <div className="flex items-center justify-center max-w-md mt-4 mb-8 mx-auto">
        <InputBase
          name="filter"
          value={filter}
          onChange={setFilter}
          placeholder="Search Builders"
          suffix={<SearchIcon className="w-7 h-6 pr-2 fill-primary/60 self-center" />}
        />
      </div>

      <InfiniteTable<UserWithChallengesData>
        columns={columns}
        queryKey={tableQueryKey}
        queryFn={({ start, size, sorting }) =>
          getSortedUsersWithChallenges({
            start,
            size,
            sorting,
            filter: debouncedFilter,
          })
        }
        initialSorting={tableInitialSorting}
        emptyStateMessage={emptyMessage}
      />
    </div>
  );
}
