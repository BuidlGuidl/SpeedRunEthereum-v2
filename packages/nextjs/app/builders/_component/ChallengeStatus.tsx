"use client";

import { forwardRef, useRef } from "react";
import { useEffect, useState } from "react";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ReviewAction } from "~~/services/database/config/types";

const REVIEW_ACTION_BADGE_CLASSES: Record<ReviewAction, string> = {
  [ReviewAction.ACCEPTED]: "badge-success",
  [ReviewAction.REJECTED]: "badge-error",
  [ReviewAction.SUBMITTED]: "badge-warning",
} as const;

const ReviewMarkdownContent = ({ content }: { content: string }) => {
  const [mdxSource, setMdxSource] = useState<MDXRemoteProps>();

  useEffect(() => {
    const prepareMDX = async () => {
      const mdxSource = await serialize(content, {
        mdxOptions: {
          rehypePlugins: [rehypeRaw],
          remarkPlugins: [remarkGfm],
          format: "md",
        },
      });
      setMdxSource(mdxSource);
    };
    prepareMDX();
  }, [content]);

  if (!mdxSource) return null;

  return (
    <div className="prose dark:prose-invert max-w-full">
      <MDXRemote {...mdxSource} />
    </div>
  );
};

type ChallengeStatusModalProps = {
  closeModal: () => void;
  comment: string;
};

const ChallengeStatusModal = forwardRef<HTMLDialogElement, ChallengeStatusModalProps>(
  ({ closeModal, comment }, ref) => {
    return (
      <dialog ref={ref} className="modal">
        <div className="modal-box max-w-[896px] w-[95%] flex flex-col space-y-3">
          <form method="dialog" className="bg-secondary -mx-6 -mt-6 px-6 py-4 flex items-center justify-between">
            <div className="flex justify-between items-center">
              <p className="font-bold text-xl m-0">Review Feedback</p>
            </div>
            <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost text-xl h-auto">
              ✕
            </button>
          </form>

          <ReviewMarkdownContent content={comment} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    );
  },
);

ChallengeStatusModal.displayName = "ChallengeStatusModal";

type ChallengeStatusProps = {
  reviewAction: ReviewAction;
  comment?: string | null;
};

export const ChallengeStatus = ({ reviewAction, comment }: ChallengeStatusProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const badgeClass = REVIEW_ACTION_BADGE_CLASSES[reviewAction];

  return (
    <div className="flex items-center gap-4">
      <span className={`badge ${badgeClass} w-[90px]`}>{reviewAction.toLowerCase()}</span>
      {comment && (
        <>
          <div className="tooltip" data-tip="Click to see review" onClick={() => modalRef.current?.showModal()}>
            <QuestionMarkCircleIcon className="h-4 w-4 cursor-pointer hover:opacity-80" />
          </div>
          <ChallengeStatusModal ref={modalRef} closeModal={() => modalRef.current?.close()} comment={comment} />
        </>
      )}
    </div>
  );
};
