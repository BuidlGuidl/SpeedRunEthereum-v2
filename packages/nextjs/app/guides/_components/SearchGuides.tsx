"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchIcon from "../../_assets/icons/SearchIcon";
import { useDebounceValue } from "usehooks-ts";

type Guide = {
  slug: string;
  title: string;
  description: string;
  image?: string;
};

export default function SearchGuides({ guides }: { guides: Guide[] }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 500);

  const filteredGuides =
    debouncedSearch.length >= 3
      ? guides.filter(
          guide =>
            guide.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            guide.description.toLowerCase().includes(debouncedSearch.toLowerCase()),
        )
      : guides;

  return (
    <>
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-sm flex items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guides..."
            className="input input-bordered w-full pr-12"
          />
          <span className="absolute right-3">
            <SearchIcon className="w-6 h-6 fill-primary/60 self-center" />
          </span>
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {filteredGuides.length === 0 ? (
          <div className="col-span-full text-center">No guides found.</div>
        ) : (
          filteredGuides.map(guide => (
            <div
              key={guide.slug}
              className="relative flex flex-col bg-base-300 rounded-xl shadow-md overflow-hidden transition hover:shadow-lg"
            >
              {guide.image ? (
                <div className="relative w-full h-48">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                    priority={false}
                  />
                </div>
              ) : (
                <div className="w-full h-32 flex items-center justify-center text-base font-bold bg-base-200 border border-secondary">
                  No Image
                </div>
              )}
              <div className="flex flex-col justify-between p-4 flex-1">
                <div>
                  <Link href={`/guides/${guide.slug}`} className="text-lg font-semibold hover:underline">
                    {guide.title}
                  </Link>
                  <p className="mt-2 text-sm text-base-content/80 line-clamp-4">{guide.description}</p>
                </div>
                <div className="mt-3">
                  <Link href={`/guides/${guide.slug}`} className="btn btn-primary btn-sm">
                    Read more
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
