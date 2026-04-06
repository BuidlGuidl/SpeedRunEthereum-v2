import { useState } from "react";
import { UIMessage } from "@ai-sdk/react";
import CopyToClipboard from "react-copy-to-clipboard";
import Markdown, { Components } from "react-markdown";
import { CheckIcon, ClipboardDocumentIcon, SparklesIcon } from "@heroicons/react/24/outline";

function CodeCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <CopyToClipboard
      text={text}
      onCopy={() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      <button
        className="absolute top-2 right-2 p-1 rounded bg-base-300/80 hover:bg-base-300 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? (
          <CheckIcon className="w-3.5 h-3.5 text-base-content" />
        ) : (
          <ClipboardDocumentIcon className="w-3.5 h-3.5 text-base-content/60" />
        )}
      </button>
    </CopyToClipboard>
  );
}

const markdownComponents: Components = {
  pre({ children, ...props }) {
    const codeElement = children as React.ReactElement<{ children?: string }>;
    const codeText =
      typeof codeElement === "object" && codeElement?.props?.children
        ? String(codeElement.props.children).replace(/\n$/, "")
        : "";

    return (
      <div className="relative group">
        <pre {...props}>{children}</pre>
        {codeText && <CodeCopyButton text={codeText} />}
      </div>
    );
  },
};

type ChatMessageProps = {
  message: UIMessage;
  isStreaming: boolean;
};

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  return (
    <div className={`chat ${message.role === "user" ? "chat-end" : "chat-start"}`}>
      {message.role === "assistant" && (
        <div className="chat-image">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
            <SparklesIcon className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>
      )}
      <div
        className={`chat-bubble ${
          message.role === "user"
            ? "chat-bubble-primary text-[13px] leading-relaxed"
            : "chat-prose-compact bg-base-200 dark:bg-[#1a2236] text-base-content border border-primary/5"
        }`}
      >
        {message.role === "assistant" ? (
          <div className="prose dark:prose-invert max-w-none overflow-hidden break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:my-1.5 [&>ul]:my-1.5 [&>ol]:my-1.5 [&_li]:my-0.5 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:max-w-full">
            {message.parts.some(p => p.type === "text" && p.text.trim().length > 0) ? (
              message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <Markdown key={i} components={markdownComponents}>
                      {part.text}
                    </Markdown>
                  );
                }
                return null;
              })
            ) : isStreaming ? (
              <span className="loading loading-dots loading-sm text-primary"></span>
            ) : null}
          </div>
        ) : (
          message.parts.map((part, i) => {
            if (part.type === "text") return <span key={i}>{part.text}</span>;
            return null;
          })
        )}
      </div>
    </div>
  );
}
