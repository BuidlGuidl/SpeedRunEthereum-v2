import { ChallengeExpandedCard } from "./_components/ChallengeExpandedCard";
import { Hero } from "./_components/Hero";
import { JoinBGCard } from "./_components/JoinBGCard";
import { connectedBuilder } from "./_data/_hardcodedUser";
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
          key="simple-nft"
          challengeId="simple-nft"
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
          hideBottomBorder
        />

        <JoinBGCard builderAttemptedChallenges={builderAttemptedChallenges} connectedBuilder={connectedBuilder} />

        <ChallengeExpandedCard
          key="state-channels"
          challengeId="state-channels"
          builderAttemptedChallenges={builderAttemptedChallenges}
        />
        <ChallengeExpandedCard
          key="learn-multisig"
          challengeId="learn-multisig"
          builderAttemptedChallenges={builderAttemptedChallenges}
        />
        <ChallengeExpandedCard
          key="nft-cohort"
          challengeId="nft-cohort"
          builderAttemptedChallenges={builderAttemptedChallenges}
          hideBottomBorder
        />
      </div>
    </div>
  );
};

export default Home;
