"use client";

import { Children, type ReactElement, type ReactNode, isValidElement, useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

export type MdxTabProps = {
  label: string;
  children?: ReactNode;
};

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

  const [storedLabel, setStoredLabel] = useLocalStorage("sre-tab-preference", "");

  const activeIndex = Math.max(
    0,
    tabItems.findIndex(item => item.props.label === storedLabel),
  );

  const handleClick = useCallback(
    (label: string) => {
      setStoredLabel(label);
    },
    [setStoredLabel],
  );

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
