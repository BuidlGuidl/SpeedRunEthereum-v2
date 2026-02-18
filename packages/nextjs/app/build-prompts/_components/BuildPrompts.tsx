"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CopyToClipboard from "react-copy-to-clipboard";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

const BUILD_PROMPTS = [
  {
    name: "Multisig Wallet",
    description: "Secure assets by requiring multiple accounts to 'vote' on transactions.",
    imageUrl: "/assets/challenges/multiSig.svg",
    repoUrl: "https://github.com/scaffold-eth/se-2-challenges/tree/challenge-multisig",
    prompt: `Build a Multisig Wallet dApp using Scaffold-ETH 2.

Core idea: A smart contract wallet that requires multiple owners to approve transactions before execution. Users can submit, approve, and execute transactions with a configurable threshold.

Key features:
- Multi-owner wallet with configurable approval threshold (e.g., 2-of-3)
- Submit, approve, and execute ETH/token transfer transactions
- Owner management (add/remove owners, change threshold)
- Transaction history and status tracking in the UI
- Events for all wallet actions

Extensions to consider:
- Support for ERC-20 token transfers
- Time-locked transactions (execution delay after approval)
- Batch transaction execution
- Off-chain signature collection (EIP-712)
- Recovery mechanism if an owner loses access

Reference repo: https://github.com/scaffold-eth/se-2-challenges/tree/challenge-multisig`,
  },
  {
    name: "SVG NFT",
    description: "Tinker around with cutting edge smart contracts that render SVGs in Solidity.",
    imageUrl: "/assets/challenges/dynamicSvgNFT.svg",
    repoUrl: "https://github.com/scaffold-eth/se-2-challenges/tree/challenge-svg-nft",
    prompt: `Build an SVG NFT dApp using Scaffold-ETH 2.

Core idea: A smart contract that generates and renders SVG artwork entirely on-chain. Each NFT's metadata and image are stored in the contract, with no external dependencies.

Key features:
- ERC-721 NFT contract that generates SVG images in Solidity
- On-chain metadata using base64-encoded JSON (tokenURI returns data URI)
- Mint function with unique generative properties per token
- Frontend to mint, view, and transfer NFTs
- SVG rendering with dynamic attributes (colors, shapes, text)

Extensions to consider:
- Randomized traits using block data or Chainlink VRF
- Interactive NFTs that change based on on-chain events
- Composable SVG layers (combine multiple NFTs)
- On-chain marketplace integration
- Animation using SVG animate elements

Reference repo: https://github.com/scaffold-eth/se-2-challenges/tree/challenge-svg-nft`,
  },
];

function PromptCard({ name, description, imageUrl, repoUrl, prompt }: (typeof BUILD_PROMPTS)[number]) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className="bg-base-300 rounded-lg shadow-md overflow-hidden dark:bg-base-200">
      <div className="pt-5 pb-4 w-full flex items-center justify-center bg-base-200">
        <Image alt={name} src={imageUrl} width={652} height={401} className="w-3/4 mx-auto" />
      </div>
      <div className="flex flex-col flex-1 px-6 py-4">
        <h2 className="text-xl font-bold mb-2 leading-tight">{name}</h2>
        <p className="text-sm my-1">{description}</p>

        <div className="mt-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="btn btn-sm btn-outline w-full flex items-center justify-between"
          >
            <span>View Prompt</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="mt-3">
              <pre className="bg-base-100 rounded-lg p-4 text-sm whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto">
                {prompt}
              </pre>
              <CopyToClipboard
                text={prompt}
                onCopy={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <button className={`btn btn-sm mt-2 w-full ${copied ? "btn-success" : "btn-primary"}`}>
                  {copied ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4" /> Copy Prompt
                    </>
                  )}
                </button>
              </CopyToClipboard>
            </div>
          )}
        </div>

        <div className="mt-3">
          <Link className="btn btn-sm btn-ghost btn-xs" href={repoUrl} target="_blank" rel="noopener noreferrer">
            View Reference Repo &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export function BuildPrompts() {
  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <h1 className="m-0 text-2xl font-bold lg:text-4xl">Build Prompts</h1>
      <p className="mt-2 text-base-content/70">
        AI-ready prompts for Ethereum build ideas. Copy a prompt into your AI agent and start building.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {BUILD_PROMPTS.map(build => (
          <PromptCard key={build.name} {...build} />
        ))}
      </div>
    </div>
  );
}
