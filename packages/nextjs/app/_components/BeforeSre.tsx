import Image from "next/image";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";

export const BeforeSre = () => {
  return (
    <section aria-labelledby="learning-lab-title" className="bg-[#96EAEA] dark:bg-[#3AACAD]">
      <div className="flex justify-center">
        <div className="relative mx-10 flex w-full max-w-7xl flex-col gap-6 border-l-[3px] border-dashed border-primary py-8 pl-7 sm:mx-14 sm:border-l-[5px] sm:pl-10 lg:flex-row lg:items-start lg:justify-between">
          <span
            aria-hidden="true"
            className="absolute -left-[8px] top-14 h-3 w-3 rounded-full border-2 border-primary bg-[#96EAEA] sm:-left-[13px] sm:h-5 sm:w-5 sm:border-4 lg:top-1/2 dark:bg-[#3AACAD]"
          />

          <div className="relative z-10 lg:w-1/2 lg:pt-6">
            <span className="inline-flex rounded-full bg-base-300 px-3 py-1 text-xs font-medium uppercase tracking-wider">
              New to Ethereum? Start here
            </span>
            <h2 id="learning-lab-title" className="mb-3 mt-5 text-xl font-medium lg:text-2xl">
              Learning Lab
            </h2>
            <p className="mb-0 mt-0 max-w-md text-sm leading-relaxed sm:text-base">
              Interactive, browser-based labs to learn the basics before you start the SpeedRun Ethereum challenges.
            </p>
            <ol
              aria-label="Learning path"
              className="mb-6 mt-4 flex flex-col gap-2 text-sm font-medium sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3"
            >
              {["Ethereum basics", "Wallets", "First Solidity contract"].map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  {index > 0 && <ArrowRightIcon aria-hidden="true" className="hidden h-3 w-3 sm:block" />}
                  {step}
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href="https://lab.buidlguidl.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-content transition-colors hover:bg-secondary-content hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-base"
              >
                Start Learning Lab
                <ArrowUpRightIcon aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a
                href="#challenges"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline decoration-primary/40 underline-offset-4 hover:decoration-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Skip
                <ArrowDownIcon aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div aria-hidden="true" className="flex justify-center lg:w-1/2">
            <Image
              src="/assets/learning-lab-island.svg"
              alt=""
              width={560}
              height={420}
              sizes="(min-width: 1024px) 440px, (min-width: 640px) 400px, 80vw"
              className="h-auto w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
