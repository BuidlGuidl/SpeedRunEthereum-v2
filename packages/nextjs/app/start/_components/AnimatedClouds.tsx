"use client";

import Image from "next/image";
import { useParallax } from "~~/hooks/useParallax";

export const AnimatedCloudsFirstSection = () => {
  const cloudsLeftStyle = useParallax(0.2);
  const cloudsRightStyle = useParallax(0.2);

  return (
    <>
      <div style={cloudsLeftStyle}>
        <Image
          src="/assets/start/clouds-left.svg"
          alt="Clouds"
          aria-hidden="true"
          className="absolute top-14 -left-24 scale-[0.65] lg:left-0 lg:scale-100 xl:left-12"
          width={332}
          height={225}
        />
      </div>
      <div style={cloudsRightStyle}>
        <Image
          src="/assets/start/clouds-right.svg"
          alt="Clouds"
          aria-hidden="true"
          className="absolute top-14 -right-32 scale-[0.65] lg:scale-100 lg:-top-6 xl:top-0 xl:-right-8"
          width={445}
          height={280}
        />
      </div>
    </>
  );
};

export const AnimatedCloudsSecondSection = () => {
  const cloudsLeftStyle = useParallax(0.1);
  const cloudsRightStyle = useParallax(0.1);

  return (
    <>
      <div style={cloudsLeftStyle}>
        <Image
          src="/assets/start/clouds-left.svg"
          alt="Clouds"
          aria-hidden="true"
          className="hidden absolute -top-32 -left-24 scale-[0.5] lg:left-0 lg:scale-100 xl:block"
          width={332}
          height={225}
        />
      </div>
      <div style={cloudsRightStyle}>
        <Image
          src="/assets/start/clouds-right.svg"
          alt="Clouds"
          aria-hidden="true"
          className="hidden absolute -top-32 -right-32 scale-[0.5] lg:block lg:scale-100 xl:-right-0"
          width={445}
          height={280}
        />
      </div>
    </>
  );
};
