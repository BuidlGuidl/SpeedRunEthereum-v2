import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const SUGGESTIONS = [
  "Let's start learning! Walk me through the challenge",
  "Help me set up locally",
  "I'm getting an error",
];

export function ChatEmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-secondary/40 flex items-center justify-center">
        <ChatBubbleLeftRightIcon className="w-7 h-7 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-base-content text-sm">Learn the concepts</p>
        <p className="text-xs text-base-content/50 mt-1 max-w-[260px]">
          Get grounded on the concepts before you dive into the code. I&apos;ll explain what this challenge is about,
          then help you set it up locally.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 mt-1 justify-center">
        {SUGGESTIONS.map(suggestion => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="text-[11px] px-3 py-1.5 rounded-full border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
