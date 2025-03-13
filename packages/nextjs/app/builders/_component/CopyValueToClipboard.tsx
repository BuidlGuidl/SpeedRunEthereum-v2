import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

export const CopyValueToClipboard = ({
  text,
  Icon,
}: {
  text: string;
  Icon?: React.ComponentType<{ className: string }>;
}) => {
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
        className={`${copied ? "tooltip-open tooltip relative" : ""} cursor-pointer`}
        data-tip="Copied to your clipboard!"
      >
        {Icon ? <Icon className="w-4 h-4" /> : <span className="underline">{text}</span>}
      </div>
    </CopyToClipboard>
  );
};
