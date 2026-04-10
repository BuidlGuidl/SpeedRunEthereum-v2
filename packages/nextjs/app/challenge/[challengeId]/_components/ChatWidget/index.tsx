"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatMessage } from "./ChatMessage";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useStickToBottom } from "use-stick-to-bottom";
import { ArrowPathIcon, PaperAirplaneIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuthSession } from "~~/hooks/useAuthSession";

type ChatWidgetProps = {
  challengeId: string;
  github: string;
};

export function ChatWidget({ challengeId, github }: ChatWidgetProps) {
  const { isAdmin } = useAuthSession();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { scrollRef, contentRef, scrollToBottom } = useStickToBottom({ resize: "smooth", initial: "smooth" });

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "submitted" || status === "streaming" || status === "error") {
      setIsSubmitting(false);
    }
  }, [status]);

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
    scrollToBottom();
    await sendMessage({ text });
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
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
                disabled={isStreaming}
                className="btn btn-xs btn-ghost text-secondary-content hover:bg-primary/10 tooltip tooltip-bottom disabled:opacity-40"
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
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5">
          <div ref={contentRef} className="space-y-4">
            {messages.length === 0 && (
              <ChatEmptyState
                onSuggestionClick={text => {
                  setInput(text);
                  textareaRef.current?.focus();
                }}
              />
            )}

            {messages.map(message => (
              <ChatMessage key={message.id} message={message} isStreaming={isStreaming} />
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
          </div>
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
