/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import HeroLogo from "../_assets/icons/HeroLogo";
import { StartChallengesButton } from "./_components/StartChallengesButton";

const StartLandingPage = () => {
  return (
    <div className="bg-[#F9FEFF] dark:bg-base-100 overflow-hidden">
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
              SpeedRunEthereum is a{" "}
              <Image
                src="/assets/start/diana.svg"
                alt="Target"
                aria-hidden="true"
                className="inline-block w-6 h-6"
                width={49}
                height={48}
              />{" "}
              hands-on series of challenges designed to help you <strong>learn by building</strong>. Each challenge
              delivers one key "aha" moment,{" "}
              <Image
                src="/assets/start/lightbulb.svg"
                alt="Lightbulb"
                aria-hidden="true"
                className="inline-block w-6 h-6"
                width={38}
                height={46}
              />{" "}
              a mental unlock about how{" "}
              <Image
                src="/assets/start/machine.svg"
                alt="Machine"
                aria-hidden="true"
                className="inline-block w-6 h-6"
                width={48}
                height={48}
              />{" "}
              Ethereum really works. At the same time, you'll be building your Ethereum portfolio.
            </p>
          </div>
        </div>
        <div className="mb-8 mx-auto w-80 h-40 bg-[url('/assets/start/window-1.svg')] bg-center bg-no-repeat lg:mb-0 lg:absolute lg:right-[5%] lg:-bottom-20">
          <div className="pt-14 px-10 md:pt-[3.25rem]">
            <p className="mt-0 mb-1 md:text-lg">Already comfortable building on Ethereum?</p>
            <a href="https://speedrunethereum.com/challenge/simple-nft-example" className="link">
              Jump straight to Challenge #0
            </a>
          </div>
        </div>
      </div>

      <div className="w-full h-[18px] bg-[url('/assets/start/color-border.svg')] bg-repeat-x"></div>
      <div className="pt-12 bg-base-300 lg:pt-24">
        <div className="max-w-4xl mx-auto px-6 text-lg lg:pb-12">
          <h2 className="text-center text-2xl font-medium mb-4 md:text-4xl">
            <Image
              src="/assets/start/diamond.svg"
              alt="Diamond"
              aria-hidden="true"
              className="relative inline-block w-10 h-10 -top-1 mr-1"
              width={49}
              height={49}
            />{" "}
            Why build on Ethereum?
          </h2>
          <p className="md:my-8 md:text-xl">
            Ethereum is a global network where you can deploy apps that <strong>run forever, can't be shut down</strong>
            , <strong>and give ownership to their creators.</strong>
          </p>

          <p className="mb-4">It works like this:</p>
          <ul className="list-disc pl-6 mb-8 space-y-4">
            <li>
              🤖 You write logic in smart contracts and deploy them to the blockchain (decentralized, immutable,
              available to anyone forever!)
            </li>
            <li>✏️ You build a frontend to interact with your smart contracts</li>
            <li>
              👥 Anyone in the world can use them or <strong>build on top</strong>: no gatekeepers, no approval needed.
            </li>
          </ul>

          <p>
            It's not just about digital assets; Ethereum lets you build systems where{" "}
            <strong>money itself is programmable</strong>. From payments and rewards to auctions and governance, logic
            becomes value.
          </p>
        </div>
        <div className="mt-12 relative h-[130px]">
          <div className="absolute inset-0 bg-[url('/assets/header_platform.svg')] bg-repeat-x bg-[length:auto_130px] z-10" />
          <div className="bg-base-100 absolute inset-0 top-auto w-full h-5" />
        </div>
      </div>
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
          <h2 className="text-center text-2xl font-medium mb-4 md:text-4xl">
            <Image
              src="/assets/start/tools.svg"
              alt="Tools"
              aria-hidden="true"
              className="relative inline-block w-10 h-10 -top-1 mr-1"
              width={49}
              height={49}
            />{" "}
            How does SpeedRunEthereum work?
          </h2>
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

          <p>
            You'll be able to <strong>tinker with smart contracts</strong>, deploy locally, test interactions, and build
            usable decentralized apps from day one.
          </p>
          <p>
            Along the way, you can submit completed challenges to your SpeedRunEthereum portfolio. Each challenge
            becomes a public proof of your learning.
          </p>

          <div>
            <p>
              Don't worry if you don't understand everything up front. Each step is designed to make things click as you
              go. Just keep going. It'll all start to make sense.
            </p>
          </div>
        </div>
        <div className="mt-12 relative h-[130px]">
          <div className="absolute inset-0 bg-[url('/assets/start/separation-trees.svg')] bg-repeat-x bg-[length:auto_130px] z-10" />
          <div className="bg-base-200 absolute inset-0 top-auto w-full h-24" />
        </div>
      </div>

      <div className="bg-base-200 py-12 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 text-lg lg:pb-12">
          <h2 className="text-center text-2xl font-medium mb-4 md:text-4xl">
            <Image
              src="/assets/start/spaceship.svg"
              alt="Spaceship"
              aria-hidden="true"
              className="relative inline-block w-10 h-10 -top-1 mr-1"
              width={47}
              height={49}
            />{" "}
            Ready?
          </h2>
          <Image
            src="/assets/challenges/simpleNFT.svg"
            alt="NFT"
            className="my-8 mx-auto max-w-md"
            width={650}
            height={400}
          />
          <p className="mb-2 text-center font-medium">Start with Challenge #0: Simple NFT Example</p>
          <p className="mt-2 text-center">You'll deploy your first smart contract and mint an NFT on a testnet.</p>
          <p className="mt-8 text-center">
            <StartChallengesButton />
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartLandingPage;
