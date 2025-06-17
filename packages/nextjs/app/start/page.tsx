/* eslint-disable react/no-unescaped-entities */
import { StartChallengesButton } from "./_components/StartChallengesButton";

const StartLandingPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <p>
          👉 <strong>Already comfortable building on Ethereum?</strong>{" "}
          <a href="https://speedrunethereum.com/challenge/simple-nft-example" className="text-blue-500 hover:underline">
            Jump straight to Challenge #0
          </a>
        </p>
      </div>

      <div className="mb-8">
        <p>
          SpeedRunEthereum is a hands-on series of challenges designed to help you <strong>learn by building</strong>.
          Each challenge delivers one key "aha" moment, a mental unlock about how Ethereum really works. At the same
          time, you'll be building your Ethereum portfolio.
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4">⚡️ Why build on Ethereum?</h2>
      <p className="mb-4">
        Ethereum is a global network where you can deploy apps that <strong>run forever, can't be shut down</strong>,{" "}
        <strong>and give ownership to their creators.</strong>
      </p>

      <p className="mb-4">It works like this:</p>
      <ul className="list-disc pl-6 mb-8">
        <li>
          🤖 You write logic in smart contracts and deploy them to the blockchain (decentralized, immutable, available
          to anyone forever!)
        </li>
        <li>✏ You build a frontend to interact with your smart contracts</li>
        <li>
          👥 Anyone in the world can use them or <strong>build on top</strong>: no gatekeepers, no approval needed.
        </li>
      </ul>

      <p className="mb-8">
        It's not just about digital assets; Ethereum lets you build systems where{" "}
        <strong>money itself is programmable</strong>. From payments and rewards to auctions and governance, logic
        becomes value.
      </p>

      <h2 className="text-2xl font-bold mb-4">🛠 How does SpeedRunEthereum work?</h2>
      <p className="mb-4">
        You'll use{" "}
        <a href="https://github.com/scaffold-eth/scaffold-eth-2" className="text-blue-500 hover:underline">
          Scaffold-ETH 2
        </a>
        , a powerful developer toolkit that gives you:
      </p>

      <ul className="list-disc pl-6 mb-8">
        <li>⚙️ A full Ethereum dev environment with local blockchain</li>
        <li>🔌 A frontend connected to your contracts</li>
        <li>🔍 Built-in Debug tools, Faucets, wallet connection, and powerful hooks and components.</li>
      </ul>

      <p className="mb-8">
        You'll be able to <strong>tinker with smart contracts</strong>, deploy locally, test interactions, and build
        usable decentralized apps from day one. Along the way, you can submit completed challenges to your
        SpeedRunEthereum portfolio. Each challenge becomes a public proof of your learning.
      </p>

      <blockquote className="border-l-4 border-gray-300 pl-4 mb-8 italic">
        Don't worry if you don't understand everything up front. Each step is designed to make things click as you go.
        Just keep going. It'll all start to make sense.
      </blockquote>

      <h2 className="text-2xl font-bold mb-4">🚀 Ready?</h2>
      <p className="mb-4">
        Start with <strong>Challenge #0: Simple NFT Example</strong>
      </p>
      <p className="mb-4">You'll deploy your first smart contract and mint an NFT on a testnet.</p>
      <p>
        <StartChallengesButton />
      </p>
    </div>
  );
};

export default StartLandingPage;
