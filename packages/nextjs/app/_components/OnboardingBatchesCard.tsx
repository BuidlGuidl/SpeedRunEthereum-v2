import { Space_Mono } from "next/font/google";
import Image from "next/image";
import JoinBatchButton from "./JoinBatchButton";
import { useLatestOpenBatch } from "~~/hooks/useLatestOpenBatch";
import { UserChallenges } from "~~/services/database/repositories/userChallenges";
import { getRelativeTime } from "~~/utils/date";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400"],
});

export const OnboardingBatchesCard = ({ userChallenges = [] }: { userChallenges?: UserChallenges }) => {
  const { data: latestOpenBatch, isLoading: isLoadingLatestOpenBatch } = useLatestOpenBatch();

  return (
    <div className="flex justify-center bg-[url(/assets/bgBanner_train.svg)] bg-bottom bg-repeat-x bg-[length:150%_auto] lg:bg-auto relative overflow-hidden bg-[#EBFFA9]">
      <Image
        src="/assets/bgBanner_joinBatchClouds.svg"
        alt="bgBanner_joinBatchClouds"
        className="absolute w-full max-w-7xl top-[10%]"
        width={820}
        height={400}
      />
      <div className="max-w-7xl py-8 mx-10 w-full sm:mx-14 pl-10 border-l-[3px] sm:border-l-[5px] border-primary relative min-h-[28rem] lg:min-h-[32rem]">
        <div className="flex justify-center relative mt-2">
          <Image
            src="/assets/bgBanner_OnboardingBatches.svg"
            // workaround to avoid console warnings
            className="max-w-[560px] w-full"
            width={0}
            height={0}
            alt="bgBanner_OnboardingBatches"
          />
        </div>
        <div className="mt-8 flex flex-col w-full items-center">
          <div className={`text-black text-center lg:text-lg lg:max-w-[500px] ${spaceMono.className}`}>
            Dive into end-to-end dApp development, receive mentorship from BG members, and learn how to collaborate with
            fellow developers in open‑source projects.
          </div>
          <div className="mt-4 flex items-center">
            <JoinBatchButton
              userChallenges={userChallenges}
              latestOpenBatch={latestOpenBatch}
              isLoadingLatestOpenBatch={isLoadingLatestOpenBatch}
            />
          </div>
          {latestOpenBatch && (
            <div className="mt-4 flex items-center gap-1 text-black">
              <span className="font-bold">{latestOpenBatch.name}</span>{" "}
              {new Date(latestOpenBatch.startDate) > new Date() ? "starting in:" : "started"}
              <span className="bg-violet-light rounded px-1 py-0.5">{getRelativeTime(latestOpenBatch.startDate)}</span>
            </div>
          )}
        </div>
        <span className="absolute h-5 w-5 rounded-full bg-base-300 border-primary border-4 top-[22%] lg:top-[30%] -left-[11px] sm:-left-[13px]" />

        <Image
          className="absolute h-6 w-5 bg-no-repeat bg-[20px_auto] top-[22%] lg:top-[30%] -left-[38px] sm:-left-[40px]"
          src="/assets/vault_icon.svg"
          alt="/assets/vault_icon.svg"
          width={24}
          height={20}
        />
      </div>
    </div>
  );
};
