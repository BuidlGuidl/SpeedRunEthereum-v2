import Image from "next/image";
import { ConnectAndRegisterSection } from "~~/app/start/_components/ConnectAndRegisterSection";
import { SpaceshipIcon } from "~~/app/start/_components/Icons";

export const BottomCta = () => {
  return (
    <>
      <div className="mt-14 lg:mt-12 relative h-[130px]">
        <div className="absolute inset-0 bg-[url('/assets/start/separation-trees.svg')] bg-repeat-x bg-[length:auto_130px] z-10" />
        <div className="bg-base-200 absolute inset-0 top-auto w-full h-24" />
      </div>
      <section className="bg-base-200 py-12 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 text-lg lg:pb-12">
          <div className="mb-12 flex flex-col items-center gap-4 lg:flex-row lg:gap-4 lg:justify-center">
            <SpaceshipIcon />
            <h2 className="m-0 text-center text-2xl font-medium md:text-4xl">Ready?</h2>
          </div>
          <Image
            src="/assets/start/ready-img.svg"
            alt="NFT"
            className="my-8 mx-auto md:max-w-md"
            width={650}
            height={400}
          />
          <ConnectAndRegisterSection />
        </div>
      </section>
    </>
  );
};
