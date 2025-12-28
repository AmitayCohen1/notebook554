"use client";

import React from "react";
import { Feather, Sparkles } from "lucide-react";

interface HeaderProps {
  wordCount: number;
  suggestionsCount: number;
  hasAnalyzed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  wordCount,
  suggestionsCount,
  hasAnalyzed,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-5 bg-[hsl(var(--surface-0)/0.85)] backdrop-blur-xl border-b border-[hsl(var(--border-subtle))]">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-primary-hover))] flex items-center justify-center text-white shadow-sm">
          <Feather className="w-[18px] h-[18px]" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold tracking-tight text-[hsl(var(--warm-800))]">
            WriteGuide
          </span>
          <span className="text-[11px] text-[hsl(var(--warm-400))] -mt-0.5">
            AI Writing Coach
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-4">
        {/* Word count pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--warm-100))] border border-[hsl(var(--warm-200))]">
          <span className="text-xs font-medium text-[hsl(var(--warm-500))] tabular-nums">
            {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
          </span>
          
          {hasAnalyzed && suggestionsCount > 0 && (
            <>
              <div className="w-px h-3 bg-[hsl(var(--warm-300))]" />
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--accent-primary))]">
                <Sparkles className="w-3 h-3" />
                {suggestionsCount}
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
