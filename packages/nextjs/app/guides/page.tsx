import SearchGuides, { Guide } from "./_components/SearchGuides";
import { getAllGuidesSlugs, getGuideBySlug } from "~~/services/guides";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const revalidate = 36000;

export const metadata = getMetadata({
  title: "Solidity Tutorials and Guides",
  description:
    "Discover in-depth Solidity tutorials and guides to help you become a blockchain developer. Learn Solidity programming, smart contract development, and best practices for building on Ethereum.",
});

export default async function GuidesPage() {
  const slugs = await getAllGuidesSlugs();
  const guides = (
    await Promise.all(
      slugs.map(async slug => {
        const guide = await getGuideBySlug(slug);
        return guide ? { ...guide, slug } : null;
      }),
    )
  ).filter(Boolean) as Guide[];

  return (
    <div className="container mx-auto px-2 py-10 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Solidity Tutorials and Guides</h1>
      <p className="mb-8 text-center text-base-content/80 max-w-2xl mx-auto">
        Start your journey with our comprehensive Solidity tutorials and guides. Whether you&apos;re new to blockchain
        development or looking to advance your smart contract skills, these resources will help you learn Solidity
        programming, understand Ethereum, and build secure decentralized applications.
      </p>
      <SearchGuides guides={guides} />
    </div>
  );
}
