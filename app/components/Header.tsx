"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface HeaderProps {
  wordCount: number;
  suggestionsCount: number;
  hasAnalyzed: boolean;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  wordCount,
  suggestionsCount,
  hasAnalyzed,
  onAnalyze,
  isAnalyzing,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-8 bg-white/90 backdrop-blur-md border-b border-stone-100">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white shadow-sm">
          <span className="font-serif font-bold italic text-lg">W</span>
        </div>
        <span className="text-base font-bold tracking-tight text-stone-900">
          WriteGuide
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <span className="text-xs font-medium text-stone-400 tabular-nums">
          {wordCount.toLocaleString()} words
        </span>
        
        {/* Primary CTA in Header */}
        {!hasAnalyzed && wordCount > 0 && onAnalyze && (
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-5 py-2 bg-stone-900 text-white text-sm font-bold rounded-full hover:bg-stone-800 transition-all shadow-sm active:translate-y-[1px] disabled:opacity-70"
          >
            {isAnalyzing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Check my writing
          </button>
        )}

        {hasAnalyzed && suggestionsCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            {suggestionsCount} Suggestions
          </div>
        )}
      </div>
    </header>
  );
};
