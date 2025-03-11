import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import DiscordIcon from "~~/app/_assets/icons/DiscordIcon";

export const CopyDiscordToClipboard = ({ text }: { text: string }) => {
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
        className={`${copied ? "tooltip-open tooltip relative " : ""}  cursor-pointer`}
        data-tip="Copied to your clipboard!"
      >
        <DiscordIcon className="w-4 h-4 fill-primary" />
      </div>
    </CopyToClipboard>
  );
};
