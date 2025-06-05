"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BuildCategory, BuildType } from "~~/services/database/config/types";

const DEBOUNCE_DELAY = 500; // 500ms delay

const useDebouncedCallback = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay]);
};

export function Filters() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [name, setName] = useState(searchParams.get("name") || "");

  const handleCategoryChange = (category: BuildCategory) => {
    if (!category) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("category");
      router.replace(`${pathname}?${newSearchParams.toString()}`);
      return;
    }

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("category", category);
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleTypeChange = (type: BuildType) => {
    if (!type) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("type");
      router.replace(`${pathname}?${newSearchParams.toString()}`);
      return;
    }

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("type", type);
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  };

  const debouncedUpdate = useDebouncedCallback(() => {
    if (name.length === 0) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("name");
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    }

    if (name.length >= 3) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("name", name);
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    }
  }, DEBOUNCE_DELAY);

  useEffect(() => {
    debouncedUpdate();
    const currentTimeout = timeoutRef.current;
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, [debouncedUpdate]);

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

      <p className="mt-6 mb-2">Name</p>
      <input
        type="text"
        className="input input-bordered w-full"
        value={name}
        placeholder="Search by name..."
        onChange={e => {
          setName(e.target.value);
        }}
      />
    </>
  );
}
