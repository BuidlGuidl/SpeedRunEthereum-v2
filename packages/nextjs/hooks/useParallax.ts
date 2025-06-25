import { useEffect, useState } from "react";

export function useParallax(speed = 0.5) {
  const [style, setStyle] = useState({ transform: "translateY(0px)" });

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const offset = scrolled * speed;
      setStyle({ transform: `translateY(${offset}px)` });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return style;
}

export function useSlideInFromRight(threshold = 0.3, distance = 200) {
  const [style, setStyle] = useState({ transform: "translateX(100vw)" });

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const elementTop = windowHeight * threshold; // Start animation when element is 30% down the viewport

      if (scrolled >= elementTop) {
        const progress = Math.min((scrolled - elementTop) / (windowHeight * 0.3), 1); // Animate over 30% of viewport height (faster)
        const translateX = distance * (1 - progress);
        setStyle({ transform: `translateX(${translateX}px)` });
      } else {
        setStyle({ transform: `translateX(${distance}px)` });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, distance]);

  return style;
}
