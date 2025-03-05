"use client";

import { ChallengeExpandedCard } from "./ChallengeExpandedCard";
import { Hero } from "./Hero";
import { JoinBGCard } from "./JoinBGCard";
import { useAccount } from "wagmi";
import { useUser } from "~~/hooks/useUser";
import { useUserChallenges } from "~~/hooks/useUserChallenges";
import { ChallengeId } from "~~/services/database/config/types";
import { Challenges } from "~~/services/database/repositories/challenges";

export const HomepageClient = ({ challenges }: { challenges: Challenges }) => {
  const { address: connectedAddress } = useAccount();

  const { data: user } = useUser(connectedAddress);

  const { data: userChallenges } = useUserChallenges(connectedAddress);

  return (
    <div>
      <Hero firstChallengeId={"simple-nft-example"} />
      <div className="bg-base-200">
        <ChallengeExpandedCard
          key={ChallengeId.SIMPLE_NFT_EXAMPLE}
          challengeId={ChallengeId.SIMPLE_NFT_EXAMPLE}
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key={ChallengeId.DECENTRALIZED_STAKING}
          challengeId={ChallengeId.DECENTRALIZED_STAKING}
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
          key={ChallengeId.MINIMUM_VIABLE_EXCHANGE}
          challengeId={ChallengeId.MINIMUM_VIABLE_EXCHANGE}
          userChallenges={userChallenges}
          challenges={challenges}
        />

        <JoinBGCard userChallenges={userChallenges} user={user} />

        <ChallengeExpandedCard
          key={ChallengeId.STATE_CHANNELS}
          challengeId={ChallengeId.STATE_CHANNELS}
          userChallenges={userChallenges}
          challenges={challenges}
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
      </div>
    </div>
  );
};
