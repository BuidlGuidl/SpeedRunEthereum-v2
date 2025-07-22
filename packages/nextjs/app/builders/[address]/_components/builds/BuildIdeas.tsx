"use client";

import Image from "next/image";
import Link from "next/link";

const BUILD_IDEAS = [
  {
    name: "Multisig Wallet",
    description: "Secure assets by requiring multiple accounts to &quot;vote&quot; on transactions.",
    imageUrl: "/assets/builds/build-multisig.png",
    url: "https://github.com/scaffold-eth/se-2-challenges/tree/challenge-6-multisig",
  },
  {
    name: "SVG NFT",
    description: "Tinker around with cutting edge smart contracts that render SVGs in Solidity.",
    imageUrl: "/assets/builds/build-svg.png",
    url: "https://github.com/scaffold-eth/se-2-challenges/tree/challenge-7-svg-nft",
  },
];

export function BuildIdeas() {
  return (
    <div>
      <p className="m-0">
        <strong>You currently have no builds.</strong> Take a look at some recommended build ideas:
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {BUILD_IDEAS.map(build => (
          <div key={build.name} className="bg-base-300 rounded-lg shadow-md overflow-hidden transition hover:shadow-lg">
            <Link href={build.url}>
              <Image alt={build.name} src={build.imageUrl} width={600} height={600} className="w-full" />
            </Link>
            <div className="flex flex-col flex-1 px-6 py-4">
              <h2 className="text-xl font-bold mb-2 leading-tight">{build.name}</h2>
              <p className="text-sm my-1">{build.description}</p>
              <div className="flex justify-between items-center pt-2 mt-2 w-full gap-2">
                <Link className="btn btn-sm btn-outline grow" href={build.url}>
                  Get Inspired
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
