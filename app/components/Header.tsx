"use client";

import React from "react";
import { Sparkles, Feather } from "lucide-react";

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
    <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-6 bg-white border-b border-stone-200">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white">
          <Feather className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold tracking-tight">WriteGuide</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-stone-100 text-[11px] font-medium text-stone-500">
          <span>{wordCount.toLocaleString()} words</span>
          {suggestionsCount > 0 && (
            <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
              <div className="w-1 h-1 rounded-full bg-indigo-600" />
              {suggestionsCount} issues
            </div>
          )}
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-1.5 bg-black text-white text-xs font-bold rounded-full hover:bg-stone-800 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          Check Writing
        </button>
      </div>
    </header>
  );
};
