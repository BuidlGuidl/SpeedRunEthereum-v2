"use client";

import { ChallengeExpandedCard } from "./ChallengeExpandedCard";
import { Hero } from "./Hero";
import { JoinBGCard } from "./JoinBGCard";
import { useAccount } from "wagmi";
import { useUser } from "~~/hooks/useUser";
import { useUserChallenges } from "~~/hooks/useUserChallenges";
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
          key="simple-nft-example"
          challengeId="simple-nft-example"
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key="decentralized-staking"
          challengeId="decentralized-staking"
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key="token-vendor"
          challengeId="token-vendor"
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key="dice-game"
          challengeId="dice-game"
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key="minimum-viable-exchange"
          challengeId="minimum-viable-exchange"
          userChallenges={userChallenges}
          challenges={challenges}
        />

        <JoinBGCard userChallenges={userChallenges} user={user} />

        <ChallengeExpandedCard
          key="state-channels"
          challengeId="state-channels"
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key="multisig"
          challengeId="multisig"
          userChallenges={userChallenges}
          challenges={challenges}
        />
        <ChallengeExpandedCard
          key="svg-nft"
          challengeId="svg-nft"
          userChallenges={userChallenges}
          challenges={challenges}
        />
      </div>
    </div>
  );
};
