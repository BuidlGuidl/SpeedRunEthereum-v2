import { ChallengeExpandedCard } from "./_components/ChallengeExpandedCard";
import { Hero } from "./_components/Hero";
import { JoinBGCard } from "./_components/JoinBGCard";
import { connectedBuilder } from "./_data/_hardcoded";
import { NextPage } from "next";
import { getAllChallenges } from "~~/services/database/repositories/challenges";

const Home: NextPage = async () => {
  const challenges = await getAllChallenges();

  const builderAttemptedChallenges = Object.fromEntries(
    Object.entries(connectedBuilder?.challenges || {}).filter(([, challengeData]) => challengeData?.status),
  );

  return (
    <div>
      <Hero firstChallengeId={challenges[0].id} />
      <div className="bg-base-200">
        <ChallengeExpandedCard
          key="simple-nft-example"
          challengeId="simple-nft-example"
          builderAttemptedChallenges={builderAttemptedChallenges}
        />
        <ChallengeExpandedCard
          key="decentralized-staking"
          challengeId="decentralized-staking"
          builderAttemptedChallenges={builderAttemptedChallenges}
        />
        <ChallengeExpandedCard
          key="token-vendor"
          challengeId="token-vendor"
          builderAttemptedChallenges={builderAttemptedChallenges}
        />
        <ChallengeExpandedCard
          key="dice-game"
          challengeId="dice-game"
          builderAttemptedChallenges={builderAttemptedChallenges}
        />
        <ChallengeExpandedCard
          key="minimum-viable-exchange"
          challengeId="minimum-viable-exchange"
          builderAttemptedChallenges={builderAttemptedChallenges}
        />

        <JoinBGCard builderAttemptedChallenges={builderAttemptedChallenges} connectedBuilder={connectedBuilder} />

        <ChallengeExpandedCard
          key="state-channels"
          challengeId="state-channels"
          builderAttemptedChallenges={builderAttemptedChallenges}
        />
        <ChallengeExpandedCard
          key="multisig"
          challengeId="multisig"
          builderAttemptedChallenges={builderAttemptedChallenges}
        />
        <ChallengeExpandedCard
          key="svg-nft"
          challengeId="svg-nft"
          builderAttemptedChallenges={builderAttemptedChallenges}
        />
      </div>
    </div>
  );
};

export default Home;
