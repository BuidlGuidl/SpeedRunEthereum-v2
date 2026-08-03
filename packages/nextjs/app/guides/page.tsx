import Link from "next/link";
import SearchGuides from "./_components/SearchGuides";
import { getAllGuides } from "~~/services/guides";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { getGuidesIndexStructuredData } from "~~/utils/structuredData";

// Shared with the structured data below so the two never drift.
const title = "Solidity Tutorials and Guides";
const description =
  "Discover in-depth Solidity tutorials and guides to help you become a blockchain developer. Learn Solidity programming, smart contract development, and best practices for building on Ethereum.";

export const metadata = getMetadata({
  title,
  description,
  path: "/guides",
});

export default async function GuidesPage() {
  const guides = await getAllGuides();
  const structuredData = getGuidesIndexStructuredData({ title, description });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="container mx-auto px-2 py-10 max-w-7xl">
        <nav aria-label="Breadcrumb" className="text-sm text-base-content/80 mb-3 text-center">
          <Link href="/" className="hover:underline">
            Speedrun Ethereum
          </Link>
          <span className="mx-1.5" aria-hidden>
            ›
          </span>
          <span>Guides</span>
        </nav>
        <h1 className="text-4xl font-bold mb-8 text-center">Solidity Tutorials and Guides</h1>
        <p className="mb-8 text-center text-base-content/80 max-w-2xl mx-auto">
          Start your journey with our comprehensive Solidity tutorials and guides. Whether you&apos;re new to blockchain
          development or looking to advance your smart contract skills, these resources will help you learn Solidity
          programming, understand Ethereum, and build secure decentralized applications.
        </p>
        <SearchGuides guides={guides} />
      </div>
    </>
  );
}
