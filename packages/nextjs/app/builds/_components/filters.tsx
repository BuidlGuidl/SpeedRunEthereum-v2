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
    <div>
      <p>Category</p>
      <select
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

      <p>Type</p>
      <select value={searchParams.get("type") || ""} onChange={e => handleTypeChange(e.target.value as BuildType)}>
        <option value="">All</option>
        {Object.values(BuildType).map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}
