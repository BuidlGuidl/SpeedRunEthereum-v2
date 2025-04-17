"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { CopyValueToClipboard } from "~~/components/CopyValueToClipboard";
import { DateWithTooltip } from "~~/components/DateWithTooltip";
import InfiniteTable from "~~/components/InfiniteTable";
import { Address } from "~~/components/scaffold-eth";
import { getSortedUsersWithChallenges } from "~~/services/api/users";
import { UserWithChallengesData } from "~~/services/database/repositories/users";
import { getUserSocialsList } from "~~/utils/socials";

export default function BuildersPage() {
  const { data: users } = useQuery({
    queryKey: ["users-count"],
    queryFn: () => getSortedUsersWithChallenges(0, 0, []),
  });

  const columns = useMemo<ColumnDef<UserWithChallengesData>[]>(
    () => [
      {
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

  return (
    <div className="mx-4 text-center">
      <h2 className="mt-10 mb-0 text-3xl">All Builders</h2>
      <div className="text-base mt-4">
        List of Ethereum builders creating products, prototypes, and tutorials with{" "}
        <Link href="https://github.com/scaffold-eth/scaffold-eth-2" className="underline">
          Scaffold-ETH 2
        </Link>
      </div>

      <div className="text-base mt-4 font-medium">Total builders: {users?.meta.totalRowCount ?? "Loading..."}</div>

      <InfiniteTable<UserWithChallengesData>
        columns={columns}
        queryKey={useMemo(() => ["users"], [])}
        queryFn={getSortedUsersWithChallenges}
        initialSorting={useMemo(() => [{ id: "lastActivity", desc: true }], [])}
      />
    </div>
  );
}
