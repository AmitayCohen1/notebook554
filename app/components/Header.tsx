"use client";

import React from "react";
import { Sparkles } from "lucide-react";

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
    <header className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-6 bg-[hsl(var(--bg-deep)/0.8)] backdrop-blur-xl border-b border-[hsl(var(--border-subtle))]">
      {/* Logo - minimal */}
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] glow" />
        <span className="text-sm font-semibold tracking-tight text-[hsl(var(--text-primary))]">
          WriteGuide
        </span>
      </div>

      {/* Status - subtle */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-[hsl(var(--text-muted))] tabular-nums">
          {wordCount.toLocaleString()} words
        </span>
        
        {hasAnalyzed && suggestionsCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--accent-soft))] border border-[hsl(var(--accent)/0.3)]">
            <Sparkles className="w-3 h-3 text-[hsl(var(--accent))]" />
            <span className="text-xs font-semibold text-[hsl(var(--accent))]">
              {suggestionsCount}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
