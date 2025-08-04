import Image from "next/image";
import { Challenges } from "~~/services/database/repositories/challenges";

type ChallengeCardProps = {
  challenge: Challenges[0];
};

export const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  if (!challenge) {
    return null;
  }

  const firstSentence = challenge.description.split(".")[0] + ".";

  return (
    <a href={`https://speedrunethereum.com/challenge/${challenge.id}`} className="block">
      <div className="bg-base-100 rounded-xl shadow-md overflow-hidden transition hover:shadow-lg border-2 border-base-300 max-w-xs mx-auto h-78 flex flex-col">
        <div className="w-full h-48 flex items-center justify-center bg-base-200">
          {challenge.previewImage ? (
            <Image
              src={challenge.previewImage}
              alt={challenge.challengeName}
              width={200}
              height={192}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg text-base-content/80">No Image</div>
          )}
        </div>
        <div className="px-4  flex-1 flex items-center">
          <p className="text-base text-base-content/90 line-clamp-3 font-normal">{firstSentence}</p>
        </div>
      </div>
    </a>
  );
};
