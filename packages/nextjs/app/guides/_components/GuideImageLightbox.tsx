"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type GuideImageLightboxProps = {
  src: string;
  alt: string;
};

export function GuideImageLightbox({ src, alt }: GuideImageLightboxProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      {/* Inline image — click to view full size */}
      <button
        type="button"
        className="cursor-zoom-in block w-full"
        onClick={() => setOpen(true)}
        aria-label={`View full size: ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="rounded-lg shadow-sm w-full" />
      </button>

      {/* Lightbox overlay — portaled to body to avoid invalid nesting inside <p> */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral/90 backdrop-blur-sm cursor-zoom-out"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={alt}
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 text-primary-content/80 hover:text-primary-content text-3xl font-light z-[10000] transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl" />
          </div>,
          document.body,
        )}
    </>
  );
}
