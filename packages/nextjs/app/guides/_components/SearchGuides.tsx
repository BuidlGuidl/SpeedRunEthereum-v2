"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchIcon from "../../_assets/icons/SearchIcon";
import { useDebounceValue } from "usehooks-ts";

export type Guide = {
  slug: string;
  title: string;
  description: string;
  image?: string;
};

export default function SearchGuides({ guides }: { guides: Guide[] }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search.trim(), 500);

  const filteredGuides =
    debouncedSearch.length >= 3
      ? guides.filter(g => (g.title + g.description).toLowerCase().includes(debouncedSearch.toLowerCase()))
      : guides;

  return (
    <>
      {/* ───────── Search box ───────── */}
      <div className="flex justify-center mb-8">
        <div className="relative flex items-center w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guides..."
            className="input input-bordered w-full pr-12"
          />
          <span className="absolute right-3">
            <SearchIcon className="w-6 h-6 fill-primary/60" />
          </span>
        </div>
      </div>

      {/* ───────── Guides list ───────── */}
      <div className="flex flex-col gap-8 mx-auto max-w-5xl items-center">
        {filteredGuides.length === 0 ? (
          <p className="text-center">No guides found.</p>
        ) : (
          filteredGuides.map(guide => (
            <article
              key={guide.slug}
              className="flex flex-col md:flex-row items-stretch
                         w-full max-w-[350px] md:max-w-none mx-auto
                         bg-base-300 rounded-xl overflow-hidden
                         shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Image / placeholder */}
              <div className="flex items-center justify-center w-full md:w-auto h-48 md:h-52">
                {guide.image ? (
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    height={192}
                    width={0}
                    className="w-full h-full object-contain object-center
                               rounded-t-xl md:rounded-l-xl md:rounded-t-none"
                    sizes="350px"
                  />
                ) : (
                  <div
                    className="flex items-center justify-center
                                  h-full w-full md:w-auto min-w-[8rem]
                                  bg-base-200 border border-secondary
                                  text-base font-bold
                                  rounded-t-xl md:rounded-l-xl md:rounded-t-none"
                  >
                    No Image
                  </div>
                )}
              </div>

              {/* Content */}
              <div
                className="relative flex flex-col justify-between flex-1
                              p-2 pb-8 md:p-6 md:pb-12 text-sm md:text-base
                              mt-6 md:mt-0 h-auto md:h-52"
              >
                <div>
                  <Link href={`/guides/${guide.slug}`} className="text-xl font-semibold hover:underline">
                    {guide.title}
                  </Link>
                  <p className="mt-4 text-base-content/80 line-clamp-3">{guide.description}</p>
                </div>

                <div className="flex justify-end mt-4 md:mt-0 md:absolute md:bottom-4 md:right-4">
                  <Link href={`/guides/${guide.slug}`} className="btn btn-primary btn-sm">
                    Read more
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
