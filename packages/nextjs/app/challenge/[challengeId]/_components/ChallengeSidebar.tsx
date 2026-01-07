"use client";

import { useEffect, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export type Heading = {
  id: string;
  text: string;
};

type ChallengeSidebarProps = {
  headings: Heading[];
};

export function ChallengeSidebar({ headings }: ChallengeSidebarProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        // Find the first heading that is intersecting
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by their position in the document and take the topmost one
          const topEntry = visibleEntries.reduce((prev, curr) => {
            return prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr;
          });
          setActiveId(topEntry.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      },
    );

    // Observe all heading elements
    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      setIsOpen(false);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile hamburger button - positioned in header area, right of logo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-44 z-50 btn btn-circle btn-sm btn-primary shadow-lg"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <nav
        className={`
          fixed z-40 bg-base-100 border-r border-base-300 overflow-y-auto
          transition-transform duration-300 ease-in-out
          lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:w-64 lg:shrink-0 lg:translate-x-0 lg:border-r-0 lg:bg-transparent
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          top-0 left-0 h-full w-72 pt-20 lg:pt-0
        `}
      >
        <div className="p-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-base-content/60 mb-4">On this page</h3>
          <ul className="space-y-1">
            {headings.map(heading => (
              <li key={heading.id}>
                <button
                  onClick={() => handleClick(heading.id)}
                  className={`
                    block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
                    hover:bg-base-200 hover:text-primary
                    ${
                      activeId === heading.id
                        ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                        : "text-base-content/70"
                    }
                  `}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
