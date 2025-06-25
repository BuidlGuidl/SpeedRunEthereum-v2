import { useEffect, useState } from "react";

export function useParallax(speed = 0.5) {
  const [style, setStyle] = useState({ transform: "translateY(0px)" });

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Reduce parallax effect on mobile devices to prevent elements from moving out of frame
      let mobileSpeed = speed;
      if (windowWidth < 768) {
        mobileSpeed = speed * 0.3; // 30% of original speed on mobile
      } else if (windowWidth < 1024) {
        mobileSpeed = speed * 0.7; // 70% of original speed on tablet
      }

      const offset = scrolled * mobileSpeed;

      // Add bounds checking to prevent excessive movement
      const maxOffset = windowHeight * 0.5; // Limit to 50% of viewport height
      const boundedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset));

      setStyle({ transform: `translateY(${boundedOffset}px)` });
    };

    const handleResize = () => {
      // Recalculate on resize to update bounds
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [speed]);

  return style;
}

export function useSlideInFromRight(threshold = 0.3, distance = 200) {
  const [style, setStyle] = useState({ transform: "translateX(0px)" });

  useEffect(() => {
    const handleScroll = () => {
      const windowWidth = window.innerWidth;

      // Disable animation on mobile devices (screen width < 768px)
      if (windowWidth < 768) {
        setStyle({ transform: "translateX(0px)" });
        return;
      }

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

    const handleResize = () => {
      // Recalculate on resize to update mobile detection
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Initial call to set correct style on mount
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [threshold, distance]);

  return style;
}
