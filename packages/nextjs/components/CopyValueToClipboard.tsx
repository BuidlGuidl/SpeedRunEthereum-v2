import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

export const CopyValueToClipboard = ({
  text,
  Icon,
  position = "top",
}: {
  text: string;
  Icon: React.ComponentType<{ className: string }>;
  position?: "top" | "bottom" | "left" | "right";
}) => {
  const tooltipPosition = {
    top: "tooltip-top",
    bottom: "tooltip-bottom",
    left: "tooltip-left",
    right: "tooltip-right",
  }[position];

  const [copied, setCopied] = useState(false);

  return (
    <CopyToClipboard
      text={text}
      onCopy={() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 1200);
      }}
    >
      <div
        className={`${copied ? "tooltip-open tooltip relative" : ""} cursor-pointer ${tooltipPosition}`}
        data-tip="Copied to your clipboard!"
      >
        <Icon className="w-4 h-4" />
      </div>
    </CopyToClipboard>
  );
};
