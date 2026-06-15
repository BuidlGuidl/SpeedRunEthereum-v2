"use client";

import { type MouseEvent, useEffect, useState } from "react";
import type { Heading } from "~~/utils/challenges";

type GuideSidebarProps = {
  headings: Heading[];
};

export function GuideSidebar({ headings }: GuideSidebarProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((prev, curr) =>
            prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr,
          );
          setActiveId(topEntry.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (event: MouseEvent, id: string) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveId(id);
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="hidden lg:block">
      <nav className="lg:sticky lg:top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2">
        <h2 className="font-semibold text-xs uppercase tracking-wider text-base-content/50 mb-3">On this page</h2>
        <ul className="border-l border-base-300">
          {headings.map(heading => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={event => handleClick(event, heading.id)}
                className={`block -ml-px border-l-2 pl-4 py-1.5 text-sm leading-snug transition-colors ${
                  activeId === heading.id
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-content/30"
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
