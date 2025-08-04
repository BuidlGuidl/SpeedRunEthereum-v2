/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import HeroLogo from "../_assets/icons/HeroLogo";
import { ChallengeCard } from "./_components/ChallengeCard";
import {
  BoyIcon,
  ComputerIcon,
  DiamondIcon,
  GirlIcon,
  LightbulbIcon,
  MachineIcon,
  SpaceshipIcon,
  TargetIcon,
  ToolsIcon,
} from "./_components/Icons";
import { StartChallengesButton } from "./_components/StartChallengesButton";
import { getAllChallenges } from "~~/services/database/repositories/challenges";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Build your first Apps on Ethereum",
  description:
    "Build your first Ethereum apps with hands-on challenges. Learn smart contracts and dapp development through real, practical experience.",
});

const StartLandingPage = async () => {
  const challenges = await getAllChallenges();

  return (
    <div className="bg-[#F9FEFF] dark:bg-base-100 overflow-hidden">
      {/* HERO SECTION */}
      <div className="relative">
        <Image
          src="/assets/start/clouds-left.svg"
          alt="Clouds"
          aria-hidden="true"
          className="absolute -top-4 -left-24 scale-50 lg:left-0 lg:scale-100 xl:left-12"
          width={332}
          height={225}
        />
        <Image
          src="/assets/start/clouds-right.svg"
          alt="Clouds"
          aria-hidden="true"
          className="absolute top-0 -right-32 scale-50 lg:scale-100 lg:-top-6 xl:top-0 xl:-right-8"
          width={445}
          height={280}
        />
        <div className="relative z-10 px-6 lg:pb-12">
          <p className="text-center mb-10 dark:text-gray-200">
            Learn how to build on <strong>Ethereum</strong>; the superpowers and the gotchas.
          </p>
          <div className="flex justify-center w-full">
            <HeroLogo className="max-w-[600px]" />
          </div>
          <div className="max-w-3xl mx-auto">
            <p className="my-10 text-lg md:my-14 md:text-center md:text-xl md:leading-relaxed">
              SpeedRunEthereum is a <TargetIcon className="inline-block w-6 h-6" /> hands-on series of challenges
              designed to help you <strong>learn by building</strong>. Each challenge delivers one key "aha" moment,{" "}
              <LightbulbIcon className="inline-block w-6 h-6" /> a mental unlock about how{" "}
              <MachineIcon className="inline-block w-6 h-6" /> Ethereum really works. At the same time, you'll be
              building your Ethereum portfolio.
            </p>
          </div>
        </div>
        {/* SHORTCUT CALL-TO-ACTION */}
        <div className="mb-8 mx-auto w-80 h-40 bg-[url('/assets/start/window-1.svg')] bg-center bg-no-repeat lg:mb-0 lg:absolute lg:right-[5%] lg:-bottom-20">
          <div className="pt-14 px-10 text-gray-600 md:pt-[3.25rem]">
            <p className="mt-0 mb-1 md:text-lg">Already comfortable building on Ethereum?</p>
            <a href="https://speedrunethereum.com/challenge/simple-nft-example" className="link">
              Jump straight to Challenge #0
            </a>
          </div>
        </div>
      </div>

      <div className="w-full h-[18px] bg-[url('/assets/start/color-border.svg')] bg-repeat-x"></div>

      {/* WHY BUILD ON ETHEREUM SECTION */}
      <div className="pt-12 bg-base-300 lg:pt-24">
        <div className="max-w-4xl mx-auto px-6 text-lg lg:pb-12">
          <div className="mb-12 flex flex-col items-center gap-4 lg:flex-row lg:gap-4 lg:justify-center">
            <DiamondIcon />
            <h2 className="m-0 text-center text-2xl font-medium md:text-4xl">Why build on Ethereum?</h2>
          </div>
          <p className="md:my-8 md:text-xl">
            Ethereum is a global network where you can deploy apps that <strong>run forever, can't be shut down</strong>
            , <strong>and give ownership to their creators.</strong>
          </p>

          <p className="mb-4">It works like this:</p>
          <ul className="list-disc pl-6 mb-12 space-y-4">
            <li>
              🤖 You write logic in smart contracts and deploy them to the blockchain (decentralized, immutable,
              available to anyone forever!)
            </li>
            <li>✏️ You build a frontend to interact with your smart contracts</li>
            <li>
              👥 Anyone in the world can use them or <strong>build on top</strong>: no gatekeepers, no approval needed.
            </li>
          </ul>

          <div className="relative bg-base-100 px-4 border-2 border-primary rounded-lg lg:bg-transparent lg:border-0 lg:mx-auto lg:w-[470px] lg:h-[111px] lg:bg-[url('/assets/start/text-bubble-left.svg')] lg:bg-no-repeat">
            <p className="lg:pt-3 lg:pl-3 lg:pr-6 lg:m-0 lg:text-gray-600">
              It's not just about digital assets; Ethereum lets you build systems where{" "}
              <strong>money itself is programmable</strong>.
            </p>
            <BoyIcon className="hidden absolute -right-12 bottom-6 lg:block" />
          </div>

          <div className="relative my-8 bg-base-100 px-4 border-2 border-primary rounded-lg lg:bg-transparent lg:border-0 lg:mx-auto lg:w-[471px] lg:h-[97px] lg:bg-[url('/assets/start/text-bubble-right.svg')] lg:bg-no-repeat">
            <p className="lg:pt-5 lg:pl-[1.5rem] lg:pr-1 lg:m-0 lg:text-gray-600">
              From payments and rewards to auctions and governance, logic becomes value.
            </p>
            <GirlIcon className="hidden absolute -left-14 bottom-4 lg:block" />
          </div>
        </div>
        {/* PLATFORM HEADER SEPARATOR */}
        <div className="mt-12 relative h-[130px]">
          <div className="absolute inset-0 bg-[url('/assets/header_platform.svg')] bg-repeat-x bg-[length:auto_130px] z-10" />
          <div className="bg-base-100 absolute inset-0 top-auto w-full h-5" />
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="relative pt-12 bg-base-100 lg:pt-24">
        <Image
          src="/assets/start/clouds-left.svg"
          alt="Clouds"
          aria-hidden="true"
          className="hidden absolute -left-24 scale-50 lg:left-0 lg:scale-100 xl:block"
          width={332}
          height={225}
        />
        <Image
          src="/assets/start/clouds-right.svg"
          alt="Clouds"
          aria-hidden="true"
          className="hidden absolute top-12 -right-32 scale-50 lg:block lg:scale-100 xl:-right-0"
          width={445}
          height={280}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-lg lg:pb-12">
          <div className="mb-12 flex flex-col items-center gap-4 lg:flex-row lg:gap-4 lg:justify-center">
            <ToolsIcon />
            <h2 className="m-0 text-center text-2xl font-medium md:text-4xl">How does SpeedRunEthereum work?</h2>
          </div>
          <p>
            You'll be able to <strong>tinker with smart contracts</strong>, deploy locally, test interactions, and build
            usable decentralized apps from day one.
          </p>
          <p>
            Along the way, you can submit completed challenges to your SpeedRunEthereum portfolio. Each challenge
            becomes a public proof of your learning.
          </p>
          <p className="mt-8 mb-4">
            You'll use{" "}
            <a href="https://github.com/scaffold-eth/scaffold-eth-2" className="link">
              Scaffold-ETH 2
            </a>
            , a powerful developer toolkit that gives you:
          </p>
          <ul className="list-disc pl-6 mb-8 space-y-4">
            <li>⚙️ A full Ethereum dev environment with local blockchain</li>
            <li>🔌 A frontend connected to your contracts</li>
            <li>🔍 Built-in Debug tools, Faucets, wallet connection, and powerful hooks and components.</li>
          </ul>

          <div className="px-4 mt-10 mx-auto bg-base-200 border-2 border-primary rounded-lg lg:border-none lg:pt-1 lg:bg-transparent lg:w-[660px] lg:h-32 lg:bg-[url('/assets/start/window-2.svg')] lg:bg-center lg:bg-no-repeat">
            <p className="lg:text-gray-600">
              Don't worry if you don't understand everything up front. Each step is designed to make things click as you
              go. Just keep going. It'll all start to make sense.
            </p>
          </div>
        </div>
      </div>

      {/* CHALLENGES OVERVIEW SECTION */}
      <div className="bg-base-100 py-12 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 flex flex-col items-center gap-4 lg:flex-row lg:gap-4 lg:justify-center">
            <ComputerIcon />
            <h2 className="m-0 text-center text-2xl font-medium md:text-4xl">Challenges Overview</h2>
          </div>

          <div className="grid grid-cols-1 mb-8 pt-6 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {challenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </div>
      </div>

      {/* TREES SEPARATOR */}
      <div className="relative h-[130px]">
        <div className="absolute inset-0 bg-[url('/assets/start/separation-trees.svg')] bg-repeat-x bg-[length:auto_130px] z-10" />
        <div className="bg-base-200 absolute inset-0 top-auto w-full h-24" />
      </div>

      {/* CALL-TO-ACTION SECTION */}
      <div className="bg-base-200 py-12 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 text-lg lg:pb-12">
          <div className="mb-12 flex flex-col items-center gap-4 lg:flex-row lg:gap-4 lg:justify-center">
            <SpaceshipIcon />
            <h2 className="m-0 text-center text-2xl font-medium md:text-4xl">Ready?</h2>
          </div>
          <Image
            src="/assets/challenges/simpleNFT.svg"
            alt="NFT"
            className="my-8 mx-auto md:max-w-md"
            width={650}
            height={400}
          />
          <p className="mb-2 text-center font-medium">Start with Challenge #0: Simple NFT Example</p>
          <p className="mt-2 text-center">You'll deploy your first smart contract and mint an NFT on a testnet.</p>
          <div className="flex justify-center">
            <StartChallengesButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartLandingPage;
