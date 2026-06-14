"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchIcon from "../../_assets/icons/SearchIcon";
import { useDebounceValue } from "usehooks-ts";
import { Guide } from "~~/services/guides";

const guideClusters = [
  {
    title: "Solidity fundamentals and token standards",
    description: "Core Solidity patterns, ERC20 tokens, NFT standards, and contract interactions.",
    slugs: [
      "how-to-create-erc20",
      "erc20-approve-pattern",
      "solidity-contract-to-contract-interactions",
      "mastering-erc721",
      "erc721-vs-erc1155",
    ],
  },
  {
    title: "DeFi engineering",
    description: "AMMs, impermanent loss, vaults, bonding curves, flash loans, and MEV mitigation.",
    slugs: [
      "automated-market-makers-math",
      "impermanent-loss-math-explained",
      "erc-4626-vaults",
      "solidity-bonding-curves-token-pricing",
      "flash-loan-exploits",
      "front-running-mev-mitigation",
    ],
  },
  {
    title: "Staking and tokenomics",
    description: "Liquid staking, rewards accounting, sustainable token supply, and staking gas patterns.",
    slugs: [
      "liquid-staking-tokens",
      "time-weighted-staking-rewards",
      "sustainable-tokenomics-staking-protocols",
      "sustainable-erc20-supply-models",
      "scalable-gas-solidity-staking",
    ],
  },
  {
    title: "NFTs and identity",
    description: "NFT use cases, security practices, and Ethereum identity with ENS.",
    slugs: ["nft-use-cases", "solidity-nft-security", "register-ens-domain-set-avatar"],
  },
  {
    title: "Randomness, games, and smart contract security",
    description: "Secure randomness, commit-reveal schemes, Chainlink VRF, and game vulnerabilities.",
    slugs: [
      "blockchain-randomness-solidity",
      "chainlink-vrf-solidity-games",
      "commit-reveal-scheme",
      "blockchain-games-vulnerabilities",
    ],
  },
];

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article className="flex flex-col md:flex-row items-stretch w-full max-w-[350px] md:max-w-none mx-auto bg-base-300 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-center w-full md:w-auto h-48 md:h-64">
        {guide.image ? (
          <Image
            src={guide.image}
            alt={guide.title}
            height={192}
            width={0}
            className="w-full h-full object-contain object-center rounded-t-xl md:rounded-l-xl md:rounded-t-none"
            sizes="350px"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full md:w-auto min-w-[8rem] bg-base-200 border border-secondary text-base font-bold rounded-t-xl md:rounded-l-xl md:rounded-t-none">
            No Image
          </div>
        )}
      </div>

      <div className="relative flex flex-col justify-between flex-1 py-4 px-6 pt-6 text-sm md:text-base">
        <div>
          <Link href={`/guides/${guide.slug}`} className="text-xl font-semibold hover:underline">
            {guide.title}
          </Link>
          <p className="mt-4 text-base-content/80 line-clamp-3">{guide.description}</p>
        </div>

        <div className="flex justify-end mt-4">
          <Link href={`/guides/${guide.slug}`} className="btn btn-primary btn-sm" aria-label={`Read ${guide.title}`}>
            Read guide
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function SearchGuides({ guides }: { guides: Guide[] }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search.trim(), 500);

  const isSearching = debouncedSearch.length >= 3;
  const filteredGuides = isSearching
    ? guides.filter(g => (g.title + g.description).toLowerCase().includes(debouncedSearch.toLowerCase()))
    : guides;
  const guidesBySlug = new Map(guides.map(guide => [guide.slug, guide]));

  return (
    <>
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

      {isSearching ? (
        <div className="flex flex-col gap-8 mx-auto max-w-5xl items-center">
          {filteredGuides.length === 0 ? (
            <p className="text-center">No guides found.</p>
          ) : (
            filteredGuides.map(guide => <GuideCard key={guide.slug} guide={guide} />)
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-12 mx-auto max-w-5xl">
          {guideClusters.map(cluster => {
            const clusterGuides = cluster.slugs.map(slug => guidesBySlug.get(slug)).filter(Boolean) as Guide[];

            if (clusterGuides.length === 0) return null;

            return (
              <section key={cluster.title} aria-labelledby={cluster.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
                <div className="mb-5 text-center md:text-left">
                  <h2 id={cluster.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="text-2xl font-bold mb-2">
                    {cluster.title}
                  </h2>
                  <p className="text-base-content/75">{cluster.description}</p>
                </div>
                <div className="flex flex-col gap-8 items-center">
                  {clusterGuides.map(guide => (
                    <GuideCard key={guide.slug} guide={guide} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
