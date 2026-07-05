"use client";

import { type ReactNode, useEffect, useId, useState } from "react";

export function InfoDialog({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-ink-2/50 font-serif text-[11px] text-ink-2 leading-none hover:border-copper hover:text-copper focus-visible:outline-2 focus-visible:outline-copper md:h-5 md:w-5 md:text-[12px]"
      >
        i
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="説明を閉じる"
            className="fixed inset-0 z-40 bg-paper/70 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="fixed top-1/2 left-1/2 z-50 w-[min(22rem,calc(100vw-32px))] max-h-[min(70vh,480px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border border-line bg-card p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:w-[min(32rem,calc(100vw-64px))] md:p-6 lg:p-7"
          >
            <div className="mb-3 flex items-start justify-between gap-3 md:mb-4">
              <h3 id={titleId} className="type-card-title font-serif">
                {title}
              </h3>
              <button
                type="button"
                aria-label="閉じる"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[14px] text-ink-2 hover:bg-panel2 hover:text-ink focus-visible:outline-2 focus-visible:outline-copper"
              >
                ×
              </button>
            </div>
            <div className="type-body-sm space-y-2.5 md:space-y-3">{children}</div>
          </div>
        </>
      ) : null}
    </>
  );
}
