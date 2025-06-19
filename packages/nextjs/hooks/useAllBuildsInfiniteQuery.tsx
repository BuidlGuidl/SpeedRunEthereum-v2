"use client";

import { useEffect, useMemo } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { fetchBuilds } from "~~/services/api/builds";
import { BuildCategory, BuildType } from "~~/services/database/config/types";

const FETCH_SIZE = 48;

export function useAllBuildsInfiniteQuery({
  categoryFilter,
  typeFilter,
  nameFilter,
}: {
  categoryFilter: BuildCategory;
  typeFilter: BuildType;
  nameFilter: string;
}) {
  const {
    data: builds,
    isLoading,
    isFetching,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["all-builds", nameFilter, categoryFilter, typeFilter],
    queryFn: async ({ pageParam = 0 }) => {
      const start = (pageParam as number) * FETCH_SIZE;
      const response = await fetchBuilds({
        name: nameFilter,
        category: categoryFilter as BuildCategory,
        type: typeFilter as BuildType,
        start,
        size: FETCH_SIZE,
      });
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastGroup, groups) => {
      if (lastGroup.data.length < FETCH_SIZE) {
        return undefined;
      }
      return groups.length;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const flatData = useMemo(() => builds?.pages?.flatMap(page => page.data) ?? [], [builds]);
  const totalBuilds = builds?.pages?.[0]?.meta?.totalRowCount ?? 0;

  useEffect(() => {
    const onscroll = () => {
      const scrolledTo = window.scrollY + window.innerHeight;
      const isReachBottom = document.body.scrollHeight === scrolledTo;
      if (isReachBottom && hasNextPage && !isFetching) {
        fetchNextPage();
      }
    };
    window.addEventListener("scroll", onscroll);
    return () => {
      window.removeEventListener("scroll", onscroll);
    };
  }, [fetchNextPage, hasNextPage, isFetching]);

  return {
    builds,
    isLoading,
    refetch,
    flatData,
    totalBuilds,
  };
}
