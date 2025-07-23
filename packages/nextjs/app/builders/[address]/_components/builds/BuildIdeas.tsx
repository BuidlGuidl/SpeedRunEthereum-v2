import Image from "next/image";
import Link from "next/link";

const BUILD_IDEAS = [
  {
    name: "Multisig Wallet",
    description: "Secure assets by requiring multiple accounts to 'vote' on transactions.",
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
      <p className="m-0 font-medium">Showcase your Ethereum builds and share them with the community!</p>
      <p className="mt-2 mb-0">
        If you&apos;re just getting started or looking for your next idea, take a look at some recommended builds below:
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {BUILD_IDEAS.map(build => (
          <div
            key={build.name}
            className="bg-base-300 rounded-lg shadow-md overflow-hidden transition hover:shadow-lg dark:bg-base-200"
          >
            <div className="w-full h-44 flex items-center justify-center">
              <Link className="w-full h-full block" href={build.url} target="_blank" rel="noopener noreferrer">
                <Image
                  alt={build.name}
                  src={build.imageUrl}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>
            <div className="flex flex-col flex-1 px-6 py-4">
              <h2 className="text-xl font-bold mb-2 leading-tight">{build.name}</h2>
              <p className="text-sm my-1">{build.description}</p>
              <div className="flex justify-between items-center pt-2 mt-2 w-full gap-2">
                <Link
                  className="btn btn-sm btn-outline grow"
                  href={build.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Build Idea
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
