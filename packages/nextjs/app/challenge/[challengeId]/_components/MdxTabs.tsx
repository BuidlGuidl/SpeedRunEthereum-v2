"use client";

import { Children, type ReactElement, type ReactNode, isValidElement, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "sre-tab-preference";

function getStoredLabel(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

function setStoredLabel(label: string) {
  localStorage.setItem(STORAGE_KEY, label);
  window.dispatchEvent(new Event("sre-tab-change"));
}

function subscribeToTabChange(callback: () => void) {
  const handler = () => callback();
  window.addEventListener("sre-tab-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("sre-tab-change", handler);
    window.removeEventListener("storage", handler);
  };
}

export type MdxTabProps = {
  label: string;
  children?: ReactNode;
};

/**
 * Convention: In challenge READMEs, each <Tab> starts with a bold label
 * matching the tab's label prop (e.g. **Hardhat** inside <Tab label="Hardhat">).
 * This makes the content readable on GitHub where <Tabs>/<Tab> JSX renders as
 * plain text. SRE strips these redundant bold labels at build time via
 * `prepareMdxReadme` in services/github.ts since the tab UI already shows the label.
 */
export function Tab(props: MdxTabProps) {
  void props;
  return null;
}

type TabsProps = {
  children: ReactNode;
  variant?: "lifted" | "boxed" | "bordered";
};

export function Tabs({ children, variant = "lifted" }: TabsProps) {
  const tabItems = Children.toArray(children).filter(isValidElement) as ReactElement<MdxTabProps>[];

  const storedLabel = useSyncExternalStore(subscribeToTabChange, getStoredLabel, () => null);

  const activeIndex = Math.max(
    0,
    tabItems.findIndex(item => item.props.label === storedLabel),
  );

  const handleClick = useCallback((label: string) => {
    setStoredLabel(label);
  }, []);

  return (
    <div className="not-prose my-4 w-full max-w-full">
      <div role="tablist" className={`tabs tabs-${variant} w-fit ml-4`}>
        {tabItems.map((item, i) => (
          <a
            key={i}
            role="tab"
            className={`tab tab-sm ${activeIndex === i ? "tab-active [--tab-bg:oklch(var(--p))] text-white dark:text-secondary" : ""}`}
            onClick={() => handleClick(item.props.label)}
          >
            {item.props.label}
          </a>
        ))}
      </div>
      {tabItems.length > 0 && (
        <div className="bg-base-200 border-primary rounded-box border border-t  p-6">
          <div className="prose dark:prose-invert max-w-none">{tabItems[activeIndex]?.props.children}</div>
        </div>
      )}
    </div>
  );
}
