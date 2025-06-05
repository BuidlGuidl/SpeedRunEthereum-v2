import Link from "next/link";
import { Filters } from "./_components/filters";
import { BuildCategory, BuildType } from "~~/services/database/config/types";
import { Build, getAllBuilds } from "~~/services/database/repositories/builds";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "All Builds",
  description: "View all the builds by the Speed Run Ethereum community",
});

export default async function AllBuildsPage({
  searchParams,
}: {
  searchParams: { category?: BuildCategory; type?: BuildType; name?: string };
}) {
  let builds: Build[] = [];
  try {
    builds = await getAllBuilds(searchParams.category, searchParams.type, searchParams.name);
  } catch (error) {
    console.error("Error fetching builds:", error);
    return <div className="py-12 px-6 max-w-7xl mx-auto w-full">Error fetching builds</div>;
  }

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <h1 className="text-2xl font-bold lg:text-4xl">All Builds</h1>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="md:col-span-2 lg:col-span-1">
          <Filters />
        </div>
        <div className="md:col-span-4 lg:col-span-5">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {builds.map(build => (
              <div
                key={build.id}
                className="relative bg-base-300 rounded-xl shadow-md overflow-hidden transition hover:shadow-lg"
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
