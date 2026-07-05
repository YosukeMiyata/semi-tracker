"use client";

import { useEffect, useState } from "react";
import { useMatch } from "react-router";
import { HOME_SECTIONS } from "~/lib/home-sections";

export function HomeSectionNavBar() {
  const isHome = useMatch({ path: "/", end: true }) !== null;

  if (!isHome) {
    return null;
  }

  return (
    <nav
      className="app-container hidden border-line border-t py-2 md:block"
      aria-label="ホーム内セクション"
    >
      <ul className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {HOME_SECTIONS.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="type-body-sm inline-block rounded-full border border-line bg-card px-3 py-1.5 whitespace-nowrap transition-colors hover:border-copper/40 hover:bg-panel2 hover:text-ink focus-visible:outline-2 focus-visible:outline-copper md:px-4 md:py-2"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function HomeHeaderMenu() {
  const isHome = useMatch({ path: "/", end: true }) !== null;
  const [open, setOpen] = useState(false);

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

  if (!isHome) {
    return null;
  }

  return (
    <div className="relative shrink-0 md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="home-section-nav"
        aria-label={open ? "メニューを閉じる" : "ホーム内セクションへジャンプ"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg border border-line bg-card focus-visible:outline-2 focus-visible:outline-copper"
      >
        <span
          className={`block h-0.5 w-[18px] rounded-full bg-ink transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
        />
        <span
          className={`block h-0.5 w-[18px] rounded-full bg-ink transition-opacity ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`block h-0.5 w-[18px] rounded-full bg-ink transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="メニューを閉じる"
            className="fixed inset-0 z-40 bg-paper/60 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <nav
            id="home-section-nav"
            className="absolute top-[calc(100%+8px)] right-0 z-50 max-h-[min(70vh,420px)] w-[min(18rem,calc(100vw-28px))] overflow-y-auto rounded-card border border-line bg-card py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            <div className="border-line border-b px-3 py-2 font-bold text-[11px] text-copper tracking-[0.1em]">
              ホーム内ジャンプ
            </div>
            <ul>
              {HOME_SECTIONS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="block border-line border-b px-3 py-2.5 text-[13px] text-ink last:border-b-0 hover:bg-panel2 focus-visible:outline-2 focus-visible:outline-copper focus-visible:-outline-offset-2"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </>
      ) : null}
    </div>
  );
}
