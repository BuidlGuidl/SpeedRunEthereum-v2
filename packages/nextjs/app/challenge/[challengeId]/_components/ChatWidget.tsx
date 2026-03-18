"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Markdown from "react-markdown";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuthSession } from "~~/hooks/useAuthSession";

type ChatWidgetProps = {
  challengeId: string;
  github: string;
};

export function ChatWidget({ challengeId, github }: ChatWidgetProps) {
  const { isAdmin } = useAuthSession();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { challengeId, github },
      }),
    [challengeId, github],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const isStreaming = status === "streaming" || status === "submitted";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    await sendMessage({ text });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 350);
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
        <div className="bg-secondary px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-secondary-content" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-content text-sm leading-tight">AI Teaching Assistant</h3>
              <p className="text-[11px] text-secondary-content/60">Guides you, won&apos;t give answers</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="btn btn-sm btn-circle btn-ghost text-secondary-content hover:bg-primary/10"
            aria-label="Close chat"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/40 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base-content text-sm">Need help with this challenge?</p>
                <p className="text-xs text-base-content/50 mt-1 max-w-[260px]">
                  Ask a question and I&apos;ll guide you through it. I won&apos;t give you direct answers — learning by
                  doing is the point!
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-1 justify-center">
                {["Where do I start?", "Explain this concept", "I'm getting an error"].map(suggestion => (
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
                className={`chat-bubble text-sm leading-relaxed ${
                  message.role === "user"
                    ? "chat-bubble-primary"
                    : "bg-base-200 dark:bg-[#1a2236] text-base-content border border-primary/5"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none overflow-hidden break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:my-1.5 [&>ul]:my-1.5 [&>ol]:my-1.5 [&_pre]:my-2 [&_pre]:text-xs [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:text-xs [&_code]:break-all">
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return <Markdown key={i}>{part.text}</Markdown>;
                      }
                      return null;
                    })}
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

          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
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
          className="shrink-0 border-t border-primary/10 bg-white dark:bg-[#0f1729] px-4 py-3 flex gap-2 items-center"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about this challenge..."
            className="input input-bordered input-sm flex-1 bg-base-200/50 dark:bg-[#1a2236] focus:border-primary/30 focus:outline-none text-sm placeholder:text-base-content/40"
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
