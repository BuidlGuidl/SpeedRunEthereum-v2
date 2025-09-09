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
  sortOrder,
}: {
  categoryFilter: BuildCategory;
  typeFilter: BuildType;
  nameFilter: string;
  sortOrder: string;
}) {
  const { data, isLoading, isFetching, isFetched, refetch, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["all-builds", nameFilter, categoryFilter, typeFilter, sortOrder],
    queryFn: async ({ pageParam = 0 }) => {
      const start = (pageParam as number) * FETCH_SIZE;
      const response = await fetchBuilds({
        name: nameFilter,
        category: categoryFilter as BuildCategory,
        type: typeFilter as BuildType,
        sortOrder,
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

  const builds = useMemo(() => data?.pages?.flatMap(page => page.data) ?? [], [data]);
  const totalBuilds = data?.pages?.[0]?.meta?.totalRowCount ?? 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage();
        }
      },
      {
        root: null, // viewport
        threshold: 0.1, // trigger when at least 10% of the target is visible
      },
    );

    // Add a sentinel element at the bottom of your content
    const sentinel = document.querySelector("#sentinel");
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetching]);

  return {
    builds,
    isLoading,
    isFetching,
    isFetched,
    refetch,
    totalBuilds,
  };
}
