import HeroDiamond from "./_assets/icons/HeroDiamond";
import HeroLogo from "./_assets/icons/HeroLogo";
import { ChallengeExpandedCard } from "./_components/ChallengeExpandedCard";
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

  // TODO: use react-plausible
  // const handleCtaClick = useCallback(() => {
  //   // if (window.plausible) {
  //   //   window.plausible("cta");
  //   // }

  //   setTimeout(() => {
  //     router.push(`/challenge/${Object.keys(challengeInfo)[0]}`);
  //   }, 100);
  // }, [router]);

  return (
    <div>
      <div className="relative bg-base-300">
        <div className="absolute inset-0 bg-[url('/assets/home_header_clouds.svg')] bg-top bg-repeat-x bg-[length:auto_300px]" />

        <div className="relative container mx-auto px-5 mb-11 flex flex-col items-center">
          <div className="mb-9 w-full flex justify-center">
            <HeroDiamond className="h-12 w-12" />
          </div>

          <p className="text-center mb-5  dark:text-gray-200">
            Learn how to build on <strong>Ethereum</strong>; the superpowers and the gotchas.
          </p>

          <div className="mb-10 lg:mb-5 mt-4 w-full flex justify-center">
            <HeroLogo className="max-w-[600px]" />
          </div>

          <button
            // onClick={handleCtaClick}
            className="mt-4 px-6 py-3 text-lg font-medium text-white bg-primary rounded-full hover:bg-neutral dark:text-gray-800 transition-colors"
          >
            Start Building on Ethereum
          </button>
        </div>

        <div className="relative h-[130px]">
          <div className="absolute inset-0 bg-[url('/assets/header_platform.svg')] bg-repeat-x bg-[length:auto_130px] z-10" />
          <div className="bg-base-200 absolute inset-0 top-auto w-full h-5" />
        </div>
      </div>

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
