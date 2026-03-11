"use client";

import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { BuildPrompt } from "~~/services/build-prompts";

function PromptItem({ name, description, prompt }: Omit<BuildPrompt, "slug">) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="collapse collapse-arrow bg-base-300 rounded-lg">
      <input type="checkbox" />
      <div className="collapse-title">
        <h2 className="text-lg font-bold leading-tight">{name}</h2>
        <p className="text-sm text-base-content/70 mt-1">{description}</p>
      </div>
      <div className="collapse-content">
        <div className="bg-base-100 rounded-lg p-4 text-sm whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto">
          {prompt}
        </div>
        <CopyToClipboard
          text={prompt}
          onCopy={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          <button className={`btn btn-sm mt-3 w-full ${copied ? "btn-success" : "btn-primary"}`}>
            {copied ? (
              <>
                <CheckCircleIcon className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-4 h-4" /> Copy Prompt
              </>
            )}
          </button>
        </CopyToClipboard>
      </div>
    </div>
  );
}

export function BuildPrompts({ prompts }: { prompts: BuildPrompt[] }) {
  return (
    <div className="py-12 px-6 max-w-4xl mx-auto w-full">
      <h1 className="m-0 text-2xl font-bold lg:text-4xl">Build Prompts</h1>
      <p className="mt-2 text-base-content/70">
        AI-ready prompts for Ethereum build ideas. Copy a prompt into your AI agent and start building.
      </p>
      <div className="mt-8 flex flex-col gap-4">
        {prompts.map(({ slug, ...rest }) => (
          <PromptItem key={slug} {...rest} />
        ))}
      </div>
    </div>
  );
}
