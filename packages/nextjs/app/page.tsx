import { ChallengeExpandedCard } from "./_components/ChallengeExpandedCard";
import { Hero } from "./_components/Hero";
import { JoinBGCard } from "./_components/JoinBGCard";
import { connectedBuilder } from "./_data/_hardcodedUser";
import { NextPage } from "next";
import { getAllChallenges } from "~~/services/database/repositories/challenges";

const LAST_CHALLENGE_BEFORE_JOIN_BG = "minimum-viable-exchange";

const Home: NextPage = async () => {
  const challenges = await getAllChallenges();

  const lastChallengeBeforeJoinBgIndex = challenges.findIndex(
    challenge => challenge.id === LAST_CHALLENGE_BEFORE_JOIN_BG,
  );

  const builderAttemptedChallenges = Object.fromEntries(
    Object.entries(connectedBuilder?.challenges || {}).filter(([, challengeData]) => challengeData?.status),
  );

  return (
    <div>
      <Hero firstChallengeId={challenges[0].id} />
      <div className="bg-base-200">
        {challenges.slice(0, lastChallengeBeforeJoinBgIndex + 1).map((challenge, index, { length }) => (
          <ChallengeExpandedCard
            key={challenge.id}
            challengeId={challenge.id}
            challenge={challenge}
            challengeIndex={challenge.sortOrder}
            builderAttemptedChallenges={builderAttemptedChallenges}
            // connectedBuilder={connectedBuilder}
            isFirst={index === 0}
            isLast={length - 1 === index}
          />
        ))}

        <JoinBGCard builderAttemptedChallenges={builderAttemptedChallenges} connectedBuilder={connectedBuilder} />

        {challenges.slice(lastChallengeBeforeJoinBgIndex + 1).map((challenge, index, { length }) => (
          <ChallengeExpandedCard
            key={challenge.id}
            challengeId={challenge.id}
            challenge={challenge}
            challengeIndex={challenge.sortOrder}
            builderAttemptedChallenges={builderAttemptedChallenges}
            // connectedBuilder={connectedBuilder}
            isLast={length - 1 === index}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
