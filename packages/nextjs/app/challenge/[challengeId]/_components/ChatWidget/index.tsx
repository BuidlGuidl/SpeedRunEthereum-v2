"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatMessage } from "./ChatMessage";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useStickToBottom } from "use-stick-to-bottom";
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
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

  const { scrollRef, contentRef, scrollToBottom, isAtBottom } = useStickToBottom({
    resize: "smooth",
    initial: "smooth",
  });

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { challengeId, github },
      }),
    [challengeId, github],
  );

  const { messages, sendMessage, setMessages, status, error, regenerate, clearError } = useChat({ transport });

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

  const handleRetry = async () => {
    if (error) clearError();
    setIsSubmitting(true);
    scrollToBottom();
    await regenerate();
  };

  const lastMessage = messages[messages.length - 1];
  const responseMissing =
    !isStreaming &&
    !error &&
    messages.length > 0 &&
    (lastMessage?.role === "user" ||
      (lastMessage?.role === "assistant" &&
        !lastMessage.parts.some(p => p.type === "text" && p.text.trim().length > 0)));

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

  useEffect(() => {
    if (isOpen) {
      document.documentElement.dataset.challengeChatOpen = "true";
      return () => {
        delete document.documentElement.dataset.challengeChatOpen;
      };
    }

    delete document.documentElement.dataset.challengeChatOpen;
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
              <h3 className="font-semibold text-secondary-content text-base leading-tight mb-0">
                AI Teaching Assistant
              </h3>
              <p className="text-xs text-secondary-content/65 leading-tight m-0">Guides you, won&apos;t give answers</p>
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
        <div className="flex-1 relative min-h-0">
          <div ref={scrollRef} className="absolute inset-0 overflow-y-auto px-4 py-5">
            <div ref={contentRef} className="space-y-4">
              {messages.length === 0 && (
                <ChatEmptyState
                  onSuggestionClick={text => {
                    setInput(text);
                    textareaRef.current?.focus();
                  }}
                />
              )}

              {messages.map((message, idx) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming && idx === messages.length - 1}
                />
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
                <div className="flex items-center gap-2.5 py-2 px-3 rounded-xl border border-error/25 bg-error/5 dark:bg-error/10">
                  <ExclamationTriangleIcon className="w-4 h-4 text-error shrink-0" />
                  <span className="flex-1 text-[13px] text-error">Connection failed.</span>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1 text-error font-medium text-[13px] hover:bg-error/10 rounded-full px-2 py-0.5 transition-colors"
                    aria-label="Retry"
                  >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    Retry
                  </button>
                </div>
              )}

              {responseMissing && (
                <div className="flex items-center gap-2.5 py-2 px-3 rounded-xl border border-base-content/10 bg-base-200/40 dark:bg-[#1a2236]/40">
                  <span className="flex-1 text-[13px] text-base-content/70">Nothing came back.</span>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1 text-primary font-medium text-[13px] hover:bg-primary/10 rounded-full px-2 py-0.5 transition-colors"
                    aria-label="Retry"
                  >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Scroll-to-bottom button — appears when the user has scrolled up from the bottom */}
          {!isAtBottom && (
            <button
              type="button"
              onClick={() => scrollToBottom()}
              className="btn btn-circle btn-sm btn-outline absolute bottom-3 left-1/2 -translate-x-1/2 bg-white dark:bg-[#0f1729] shadow-md hover:bg-base-200 dark:hover:bg-[#1a2236] z-10"
              aria-label="Scroll to latest message"
            >
              <ArrowDownIcon className="w-4 h-4" />
            </button>
          )}
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
