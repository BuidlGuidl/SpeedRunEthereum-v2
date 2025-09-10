// Local proxy to render the shared CourseStats inside the hero without creating
// import cycles at the page level.
import { CourseStats as HeroStatsProxy } from "./CourseStats";

export const HeroSection = () => {
  return (
    <section className="relative bg-base-300">
      <div className="absolute inset-0 bg-[url('/assets/home_header_clouds.svg')] bg-top bg-repeat-x bg-[length:auto_200px] sm:bg-[length:auto_300px]" />
      <div className="relative container mx-auto px-6 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Learn Solidity with our
          <br className="hidden md:block" />
          <span className="text-primary"> Web3 Developer Course</span>
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-base-content/80 md:text-lg">
          Master Solidity with our hands-on tutorials. Build real dApps, complete interactive challenges, and create
          your on-chain developer portfolio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-base-content/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" /> 100% Free
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" /> Hands‑On Learning
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" /> Build Real Projects
          </div>
        </div>
        {/* Course stats below hero copy */}
        <div className="mt-8">
          <HeroStatsProxy />
        </div>
      </div>
      <div className="relative h-[130px]">
        <div className="absolute inset-0 bg-[url('/assets/header_platform.svg')] bg-repeat-x bg-[length:auto_130px] z-10" />
        <div className="bg-base-200 absolute inset-0 top-auto w-full h-5" />
      </div>
    </section>
  );
};
