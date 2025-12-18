"use client";

import { AfterSreCard } from "./AfterSreCard";
import { AfterSreLine } from "./AfterSreLine";
import { ChallengeExpandedCard } from "./ChallengeExpandedCard";
import { Hero } from "./Hero";
import { OnboardingBatchesCard } from "./OnboardingBatchesCard";
import { useAccount } from "wagmi";
import { useUserChallenges } from "~~/hooks/useUserChallenges";
import { ChallengeId } from "~~/services/database/config/types";
import { Challenges } from "~~/services/database/repositories/challenges";

export const HomepageClient = ({ challenges }: { challenges: Challenges }) => {
  const { address: connectedAddress } = useAccount();

  const { data: userChallenges } = useUserChallenges(connectedAddress);

  return (
    <div>
      <Hero />
      <div className="bg-base-200">
        <ChallengeExpandedCard
          key={ChallengeId.TOKENIZATION}
          challengeId={ChallengeId.TOKENIZATION}
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.CROWDFUNDING}
          challengeId={ChallengeId.CROWDFUNDING}
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.TOKEN_VENDOR}
          challengeId={ChallengeId.TOKEN_VENDOR}
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.DICE_GAME}
          challengeId={ChallengeId.DICE_GAME}
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.DEX}
          challengeId={ChallengeId.DEX}
          userChallenges={userChallenges}
          challenges={challenges}
        />

        <OnboardingBatchesCard userChallenges={userChallenges} />

        <ChallengeExpandedCard
          key={ChallengeId.OVER_COLLATERALIZED_LENDING}
          challengeId={ChallengeId.OVER_COLLATERALIZED_LENDING}
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.STABLECOINS}
          challengeId={ChallengeId.STABLECOINS}
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.PREDICTION_MARKETS}
          challengeId={ChallengeId.PREDICTION_MARKETS}
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.ZK_VOTING}
          challengeId={ChallengeId.ZK_VOTING}
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.ORACLES}
          challengeId={ChallengeId.ORACLES}
          userChallenges={userChallenges}
          challenges={challenges}
          comingSoon
        />
        <ChallengeExpandedCard
          key={ChallengeId.MULTISIG}
          challengeId={ChallengeId.MULTISIG}
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.SVG_NFT}
          challengeId={ChallengeId.SVG_NFT}
          userChallenges={userChallenges}
          challenges={challenges}
        />

        <div className="flex flex-col xl:flex-row justify-center mx-auto relative">
          <AfterSreLine />
          <div className="hidden xl:flex flex-grow bg-[#96EAEA] dark:bg-[#3AACAD]" />
          <AfterSreCard
            title="ETH Tech Tree"
            description="Check this advanced Solidity challenges to test your Ethereum dev skills."
            externalLink="https://www.ethtechtree.com"
            buttonText="Join"
            previewImage="/assets/challenges/techTree.svg"
            bgClassName="bg-[#96EAEA] dark:bg-[#3AACAD]"
          />
          <AfterSreCard
            title="Capture the Flag"
            description="Join our CTF game and hack your way through 12 Smart Contract challenges."
            externalLink="https://ctf.buidlguidl.com"
            buttonText="Start"
            previewImage="/assets/challenges/ctf.svg"
            bgClassName="bg-base-300"
          />
          <div className="hidden xl:flex flex-grow bg-base-300" />
        </div>
      </div>
    </div>
  );
};
