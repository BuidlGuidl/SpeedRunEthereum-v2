import HeroDiamond from "../_assets/icons/HeroDiamond";
import HeroLogo from "../_assets/icons/HeroLogo";
import { StartBuildingButton } from "./StartBuildingButton";

export const Hero = ({ firstChallengeId }: { firstChallengeId: string }) => {
  return (
    <div className="relative bg-base-300">
      <div className="absolute inset-0 bg-[url('/assets/home_header_clouds.svg')] bg-top bg-repeat-x bg-[length:auto_200px] sm:bg-[length:auto_300px]" />

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

        <StartBuildingButton firstChallengeId={firstChallengeId} />
      </div>

      <div className="relative h-[130px]">
        <div className="absolute inset-0 bg-[url('/assets/header_platform.svg')] bg-repeat-x bg-[length:auto_130px] z-10" />
        <div className="bg-base-200 absolute inset-0 top-auto w-full h-5" />
      </div>
    </div>
  );
};
