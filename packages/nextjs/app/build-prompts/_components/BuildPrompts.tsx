"use client";

import { useState } from "react";
import Image from "next/image";
import CopyToClipboard from "react-copy-to-clipboard";
import { ClipboardDocumentIcon, EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { BuildPrompt } from "~~/services/build-prompts";

function PromptCard({ prompt, onView }: { prompt: BuildPrompt; onView: (p: BuildPrompt) => void }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative flex flex-col bg-base-300 rounded-xl shadow-md overflow-hidden transition hover:shadow-lg">
      {prompt.imageUrl && (
        <div className="pt-5 pb-4 w-full flex items-center justify-center bg-[#F8FDFF] dark:bg-[#098b8b]">
          <Image alt={prompt.name} src={prompt.imageUrl} width={652} height={401} className="w-3/4 mx-auto" />
        </div>
      )}
      <div className="flex flex-col flex-1 px-5 py-4">
        <h2 className="text-lg font-bold mb-1 leading-tight">{prompt.name}</h2>
        <p className="text-sm text-base-content/70 my-0 flex-1">{prompt.description}</p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => onView(prompt)} className="btn btn-sm btn-outline flex-1">
            <EyeIcon className="w-4 h-4" />
            View
          </button>
          <CopyToClipboard
            text={prompt.prompt}
            onCopy={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <button className={`btn btn-sm flex-1 ${copied ? "btn-success" : "btn-primary"}`}>
              {copied ? (
                <>
                  <CheckCircleIcon className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-4 h-4" /> Copy
                </>
              )}
            </button>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  );
}

function PromptModal({ prompt, onClose }: { prompt: BuildPrompt; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  return (
    <dialog className="modal modal-open" onClick={onClose}>
      <div
        className="modal-box max-w-[90%] md:max-w-3xl w-full max-h-[70vh] md:max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" onClick={onClose}>
          <XMarkIcon className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-xl pr-8">{prompt.name}</h3>
        <p className="text-sm text-base-content/70 mt-1">{prompt.description}</p>

        <div className="mt-4 bg-base-200 rounded-lg p-4 text-sm whitespace-pre-wrap overflow-x-auto overflow-y-auto flex-1 min-h-0">
          {prompt.prompt}
        </div>

        <div className="modal-action mt-4">
          <CopyToClipboard
            text={prompt.prompt}
            onCopy={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <button className={`btn w-full ${copied ? "btn-success" : "btn-primary"}`}>
              {copied ? (
                <>
                  <CheckCircleIcon className="w-5 h-5" /> Copied!
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-5 h-5" /> Copy Prompt
                </>
              )}
            </button>
          </CopyToClipboard>
        </div>
      </div>
    </dialog>
  );
}

export function BuildPrompts({ prompts }: { prompts: BuildPrompt[] }) {
  const [selected, setSelected] = useState<BuildPrompt | null>(null);

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto w-full">
      <h1 className="m-0 text-2xl font-bold lg:text-4xl">Build Prompts</h1>
      <p className="mt-2 text-base-content/70">
        AI-ready prompts for Ethereum build ideas. Copy a prompt into your AI agent and start building.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map(prompt => (
          <PromptCard key={prompt.slug} prompt={prompt} onView={setSelected} />
        ))}
      </div>

      {selected && <PromptModal prompt={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
