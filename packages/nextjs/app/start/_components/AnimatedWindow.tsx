"use client";

import { useSlideInFromRight } from "~~/hooks/useParallax";

interface AnimatedWindowProps {
  className?: string;
  children: React.ReactNode;
}

export const AnimatedWindow = ({ className = "", children }: AnimatedWindowProps) => {
  const windowSlideStyle = useSlideInFromRight(0.05, 350);

  return (
    <div
      className={`mb-10 mx-auto w-80 h-40 bg-[url('/assets/start/window-1.svg')] bg-center bg-no-repeat lg:mb-0 lg:absolute lg:right-[5%] lg:-bottom-20 ${className}`}
      style={windowSlideStyle}
    >
      {children}
    </div>
  );
};
