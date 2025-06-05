"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BuildCategory, BuildType } from "~~/services/database/config/types";

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: BuildCategory) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("category", category);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleTypeChange = (type: BuildType) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("type", type);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <>
      <p className="mt-0 mb-2">Category</p>
      <select
        className="select select-bordered w-full"
        value={searchParams.get("category") || ""}
        onChange={e => handleCategoryChange(e.target.value as BuildCategory)}
      >
        <option value="">All</option>
        {Object.values(BuildCategory).map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <p className="mt-6 mb-2">Type</p>
      <select
        className="select select-bordered w-full"
        value={searchParams.get("type") || ""}
        onChange={e => handleTypeChange(e.target.value as BuildType)}
      >
        <option value="">All</option>
        {Object.values(BuildType).map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </>
  );
}
