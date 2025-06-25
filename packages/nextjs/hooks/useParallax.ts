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
