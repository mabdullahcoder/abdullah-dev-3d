"use client";

import { Menu } from "lucide-react";

export default function Nav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100vw-2*var(--gutter))] max-w-[400px] -translate-x-1/2 md:bottom-6"
    >
      <div className="flex h-[52px] items-center justify-between rounded-lg bg-[#111] p-1.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)]">
        <button
          type="button"
          aria-label="Open menu"
          className="group flex items-center gap-3 pr-2 text-white"
        >
          <span className="flex size-10 items-center justify-center rounded-sm bg-lime text-ink transition-colors group-hover:bg-[#b8f53f]">
            <Menu size={20} strokeWidth={2} />
          </span>
          <span className="text-xs font-semibold">Menu</span>
        </button>

        <a
          href="#top"
          className="text-base font-bold text-white transition-opacity hover:opacity-75"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Abdullah
        </a>

        <a
          href="#contact"
          className="flex h-10 items-center rounded-sm bg-lime px-4 text-sm font-medium text-ink transition-colors hover:bg-[#b8f53f]"
        >
          Contact Us
        </a>
      </div>
    </nav>
  );
}
