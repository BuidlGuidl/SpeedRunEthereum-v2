import Image from "next/image";
import Link from "next/link";
import { ChallengeId } from "~~/services/database/config/types";
import { Challenges } from "~~/services/database/repositories/challenges";

type ChallengeCardProps = {
  challenge: Challenges[0];
};

export const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  if (!challenge) {
    return null;
  }

  const firstSentence = challenge.description.split(".")[0] + ".";
  const isComingSoon = challenge.id === ChallengeId.DEPLOY_TO_L2;
  const isBuilderSuggestion = challenge.id === ChallengeId.MULTISIG || challenge.id === ChallengeId.SVG_NFT;

  const cardContent = (
    <div
      className={`bg-base-100 rounded-xl shadow-md overflow-hidden transition hover:shadow-lg border-2 max-w-xs mx-auto flex flex-col ${
        isBuilderSuggestion ? "border-[#FFCB7E] dark:border-[#D5853B]" : "border-base-300"
      }`}
    >
      <div
        className={`w-full h-24 md:h-40 lg:h-48 flex items-center justify-center relative ${
          isBuilderSuggestion ? "bg-[#FFE9C9] dark:bg-[#7E4510]" : "bg-base-200 dark:bg-teal-800"
        }`}
      >
        {challenge.previewImage ? (
          <Image
            src={challenge.previewImage}
            alt={challenge.challengeName}
            width={200}
            height={128}
            className="w-full h-full object-contain p-3 md:p-4"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg text-base-content/80">No Image</div>
        )}
        {isComingSoon && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center text-sm md:text-base text-base-content bg-[#8CD9DA] px-3 md:px-4 py-1.5 rounded-full">
              Coming Soon
            </span>
          </div>
        )}
        {isBuilderSuggestion && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center text-sm md:text-base text-base-content bg-[#FFBB54] text-base-content px-3 md:px-4 py-1.5 rounded-full">
              Build Idea
            </span>
          </div>
        )}
      </div>
      <div className="px-4 pb-1 pt-1 flex-1 flex items-start bg-base-100 dark:bg-teal-950">
        <p className="text-sm md:text-base text-base-content/90 line-clamp-4 font-normal leading-tight md:leading-normal">
          {firstSentence}
        </p>
      </div>
    </div>
  );

  if (isComingSoon) {
    return <div className="flex cursor-not-allowed">{cardContent}</div>;
  }

  return (
    <Link href={`/challenge/${challenge.id}`} className="flex">
      {cardContent}
    </Link>
  );
};
