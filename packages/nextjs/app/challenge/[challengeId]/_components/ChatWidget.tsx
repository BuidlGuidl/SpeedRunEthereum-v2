"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Markdown, { Components } from "react-markdown";
import {
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuthSession } from "~~/hooks/useAuthSession";

// TODO: Updte / cleanup the logic in this file since some of this can be achived by already present hooks like usehooks-ts or simpler approch.
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1 rounded bg-base-300/80 hover:bg-base-300 transition-colors opacity-0 group-hover:opacity-100"
      aria-label="Copy code"
    >
      {copied ? (
        <CheckIcon className="w-3.5 h-3.5 text-success" />
      ) : (
        <ClipboardDocumentIcon className="w-3.5 h-3.5 text-base-content/60" />
      )}
    </button>
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
        {codeText && <CopyButton text={codeText} />}
      </div>
    );
  },
};

type ChatWidgetProps = {
  challengeId: string;
  github: string;
};

export function ChatWidget({ challengeId, github }: ChatWidgetProps) {
  const { isAdmin } = useAuthSession();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { challengeId, github },
      }),
    [challengeId, github],
  );

  const { messages, sendMessage, setMessages, status, error } = useChat({ transport });

  // Track when we've submitted but status may not have caught up yet.
  // This closes the race-condition gap where the user message appears
  // in the array but status is still "ready" for one render cycle.
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Once the SDK's own status catches up (submitted/streaming/error),
    // our manual bridge flag is no longer needed.
    if (status === "submitted" || status === "streaming" || status === "error") {
      setIsSubmitting(false);
    }
  }, [status]);

  // Also clear on error object appearing (covers edge case where
  // sendMessage rejects but status doesn't transition)
  useEffect(() => {
    if (error) setIsSubmitting(false);
  }, [error]);

  const isStreaming = status === "streaming" || status === "submitted" || isSubmitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsSubmitting(true);
    await sendMessage({ text });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleStartLearning = async () => {
    setIsSubmitting(true);
    await sendMessage({ text: "Let's start learning! Teach me the concepts." });
  };

  const handleReset = () => {
    setMessages([]);
    setIsSubmitting(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isAdmin) return null;

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 z-50 btn btn-circle btn-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${isOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}
        aria-label="Open AI chat assistant"
      >
        <SparklesIcon className="w-6 h-6" />
      </button>

      {/* Backdrop (mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] z-50 flex flex-col bg-white dark:bg-[#0f1729] border-l border-primary/10 shadow-[-8px_0_30px_-12px_rgba(8,132,132,0.15)] transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="bg-secondary px-3 py-6 shrink-0 flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 shrink-0 flex items-center justify-center mt-[3px]">
              <SparklesIcon className="w-5 h-5 text-secondary-content" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-secondary-content text-sm leading-tight mb-0">AI Teaching Assistant</h3>
              <p className="text-[11px] text-secondary-content/60 leading-tight m-0">
                Guides you, won&apos;t give answers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-[3px]">
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                className="btn btn-xs btn-ghost text-secondary-content hover:bg-primary/10 tooltip tooltip-bottom"
                data-tip="Start over"
                aria-label="Start over"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-xs btn-circle btn-ghost text-secondary-content hover:bg-primary/10"
              aria-label="Close chat"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/40 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base-content text-sm">Learn the concepts</p>
                <p className="text-xs text-base-content/50 mt-1 max-w-[260px]">
                  Get grounded on the concepts before you dive into the code. I&apos;ll explain what this challenge is
                  about, then help you set it up locally.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-1 justify-center">
                <button
                  onClick={handleStartLearning}
                  disabled={isStreaming}
                  className="text-[12px] font-medium px-4 py-2 rounded-full bg-primary text-primary-content hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  Start Learning
                </button>
                {["Help me set up locally", "I'm getting an error"].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(message => (
            <div key={message.id} className={`chat ${message.role === "user" ? "chat-end" : "chat-start"}`}>
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
          ))}

          {isStreaming && messages[messages.length - 1]?.role === "user" && (
            <div className="chat chat-start">
              <div className="chat-image">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                  <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <div className="chat-bubble bg-base-200 dark:bg-[#1a2236] text-base-content border border-primary/5">
                <span className="loading loading-dots loading-sm text-primary"></span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert bg-error/10 border border-error/20 text-error text-sm rounded-xl mx-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Something went wrong. Please try again.</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-primary/10 bg-white dark:bg-[#0f1729] px-4 py-3 flex gap-2 items-end"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this challenge..."
            rows={1}
            className="textarea textarea-bordered textarea-sm flex-1 bg-base-200/50 dark:bg-[#1a2236] focus:border-primary/30 focus:outline-none text-sm placeholder:text-base-content/40 resize-none min-h-[36px] max-h-[160px] leading-[1.4] !rounded-lg py-2"
            disabled={isStreaming}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm btn-circle shrink-0 disabled:opacity-40"
            disabled={isStreaming || !input.trim()}
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
