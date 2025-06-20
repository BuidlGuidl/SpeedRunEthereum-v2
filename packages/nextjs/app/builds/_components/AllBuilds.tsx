"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useDebounceValue } from "usehooks-ts";
import { LikeBuildButton } from "~~/app/builders/[address]/_components/builds/LikeBuildButton";
import { useAllBuildsInfiniteQuery } from "~~/hooks/useAllBuildsInfiniteQuery";
import { BuildCategory, BuildType } from "~~/services/database/config/types";

export function AllBuilds({ searchParams }: { searchParams: { category?: BuildCategory; type?: BuildType } }) {
  const router = useRouter();
  const pathname = usePathname();
  const [categoryFilter, setCategoryFilter] = useState(searchParams.category || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.type || "");
  const [nameFilter, setNameFilter] = useState("");

  const [debouncedFilter] = useDebounceValue(nameFilter.length >= 3 ? nameFilter : "", 500);

  const { builds, isLoading, isFetching, isFetched, refetch, totalBuilds } = useAllBuildsInfiniteQuery({
    categoryFilter: categoryFilter as BuildCategory,
    typeFilter: typeFilter as BuildType,
    nameFilter: debouncedFilter,
  });

  const handleCategoryChange = (category: BuildCategory) => {
    if (!category) {
      setCategoryFilter("");
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("category");
      router.replace(`${pathname}?${newSearchParams.toString()}`);
      return;
    }

    setCategoryFilter(category);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("category", category);
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleTypeChange = (type: BuildType) => {
    if (!type) {
      setTypeFilter("");
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("type");
      router.replace(`${pathname}?${newSearchParams.toString()}`);
      return;
    }

    setTypeFilter(type);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("type", type);
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <h1 className="m-0 text-2xl font-bold lg:text-4xl">All Builds</h1>
      </div>
      <div className="mt-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          <div>
            <p className="mt-0 mb-1 text-sm lg:mb-2">
              {nameFilter ? "Filtering" : "Filter"} By Name{" "}
              {nameFilter && <span className="ml-1 inline-block w-2 h-2 bg-[#facb83] rounded-full"></span>}
            </p>
            <input
              type="text"
              className="input input-sm input-bordered w-full"
              name="filter"
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
              placeholder="Search by name..."
            />
          </div>

          <div>
            <p className="mt-0 mb-1 text-sm lg:mb-2">
              {categoryFilter ? "Filtering" : "Filter"} By Category{" "}
              {categoryFilter && <span className="ml-1 inline-block w-2 h-2 bg-[#facb83] rounded-full"></span>}
            </p>
            <select
              className="select select-sm select-bordered w-full"
              value={categoryFilter}
              onChange={e => handleCategoryChange(e.target.value as BuildCategory)}
            >
              <option value="">All</option>
              {Object.values(BuildCategory).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mt-0 mb-1 text-sm lg:mb-2">
              {typeFilter ? "Filtering" : "Filter"} By Type{" "}
              {typeFilter && <span className="ml-1 inline-block w-2 h-2 bg-[#facb83] rounded-full"></span>}
            </p>
            <select
              className="select select-sm select-bordered w-full"
              value={typeFilter}
              onChange={e => handleTypeChange(e.target.value as BuildType)}
            >
              <option value="">All</option>
              {Object.values(BuildType).map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mt-0 mb-1 text-sm lg:mb-2">Total Builds</p>
            {isLoading ? (
              <div className="skeleton rounded-md w-24 h-7"></div>
            ) : (
              <p className="m-0 text-lg font-semibold">{totalBuilds}</p>
            )}
          </div>
        </div>
        <hr className="hidden my-6 border-base-300 lg:block" />
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {isLoading && (
              <>
                <LoadingSkeleton />
                <LoadingSkeleton />
                <LoadingSkeleton />
                <LoadingSkeleton />
              </>
            )}
            {isFetched &&
              Boolean(builds.length > 0) &&
              builds.map(build => (
                <div
                  key={build.id}
                  className="relative flex flex-col bg-base-300 rounded-xl shadow-md overflow-hidden transition hover:shadow-lg"
                >
                  <div className="w-full h-44 flex items-center justify-center">
                    <Link href={`/builds/${build.id}`} className="w-full h-full block">
                      {build.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={build.imageUrl} alt={build.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold bg-base-200 border border-secondary">
                          No Image
                        </div>
                      )}
                    </Link>
                  </div>
                  <div className="flex flex-col flex-1 px-6 py-4">
                    <h2 className="text-xl font-bold mb-2 leading-tight line-clamp-2">{build.name}</h2>
                    <p className="text-sm my-1 line-clamp-4">{build.desc}</p>
                    <div className="flex-1" />
                    <div className="flex justify-between items-center pt-2 mt-2 w-full gap-2">
                      <Link className="btn btn-sm btn-outline grow" href={`/builds/${build.id}`}>
                        View
                      </Link>
                      <div className="flex items-center gap-1">
                        <LikeBuildButton
                          buildId={build.id}
                          likes={build.likes.map(like => like.userAddress)}
                          onSuccess={() => refetch()}
                        />
                        <span className="text-base">{build.likes.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {/* Show loading skeleton when fetching during scrolling */}
            {!isLoading && isFetching && (
              <>
                <LoadingSkeleton />
                <LoadingSkeleton />
                <LoadingSkeleton />
                <LoadingSkeleton />
              </>
            )}
            {isFetched && builds.length === 0 && (
              <div role="alert" className="alert alert-info md:col-span-2 lg:col-span-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 shrink-0 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>No builds found. Please try searching with different filters.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
