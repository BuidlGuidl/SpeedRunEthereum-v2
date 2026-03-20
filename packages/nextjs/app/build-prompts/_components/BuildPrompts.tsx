"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ClipboardDocumentIcon, EyeIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { BuildPrompt } from "~~/services/build-prompts";

function CopyButton({
  text,
  className,
  iconSize = "w-4 h-4",
}: {
  text: string;
  className?: string;
  iconSize?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className={`btn ${copied ? "btn-success" : "btn-primary"} ${className ?? ""}`}>
      {copied ? (
        <>
          <CheckCircleIcon className={iconSize} /> Copied!
        </>
      ) : (
        <>
          <ClipboardDocumentIcon className={iconSize} /> Copy
        </>
      )}
    </button>
  );
}

function PromptCard({ prompt, onView }: { prompt: BuildPrompt; onView: (p: BuildPrompt) => void }) {
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
          <CopyButton text={prompt.prompt} className="btn-sm flex-1" />
        </div>
      </div>
    </div>
  );
}

type PromptModalProps = {
  closeModal: () => void;
  prompt: BuildPrompt;
};

const PromptModal = forwardRef<HTMLDialogElement, PromptModalProps>(({ closeModal, prompt }, ref) => {
  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box max-w-[90%] md:max-w-3xl w-full max-h-[70vh] md:max-h-[85vh] flex flex-col">
        <form method="dialog" className="flex items-center justify-between -mx-6 -mt-6 px-6 py-4 bg-secondary">
          <h3 className="font-bold text-xl m-0">{prompt.name}</h3>
          <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost text-xl h-auto">
            ✕
          </button>
        </form>

        <p className="text-sm text-base-content/70 mt-4">{prompt.description}</p>

        <div className="mt-4 bg-base-200 rounded-lg p-4 text-sm whitespace-pre-wrap overflow-x-auto overflow-y-auto flex-1 min-h-0">
          {prompt.prompt}
        </div>

        <div className="modal-action mt-4">
          <CopyButton text={prompt.prompt} className="w-full" iconSize="w-5 h-5" />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>close</button>
      </form>
    </dialog>
  );
});

PromptModal.displayName = "PromptModal";

export function BuildPrompts({ prompts }: { prompts: BuildPrompt[] }) {
  const [selected, setSelected] = useState<BuildPrompt | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = (prompt: BuildPrompt) => {
    setSelected(prompt);
    // Use queueMicrotask so the dialog element renders before showModal() is called
    queueMicrotask(() => modalRef.current?.showModal());
  };

  const closeModal = () => {
    modalRef.current?.close();
    setSelected(null);
  };

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto w-full">
      <h1 className="m-0 text-2xl font-bold lg:text-4xl">Build Prompts</h1>
      <p className="mt-2 text-base-content/70">
        AI-ready prompts for Ethereum build ideas. Copy a prompt into your AI agent and start building.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map(prompt => (
          <PromptCard key={prompt.slug} prompt={prompt} onView={openModal} />
        ))}
      </div>

      {selected && <PromptModal ref={modalRef} prompt={selected} closeModal={closeModal} />}
    </div>
  );
}
