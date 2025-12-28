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
    <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-6 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black">
          <Feather className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white">WriteGuide</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 text-[11px] font-medium text-white/50">
          <span>{wordCount.toLocaleString()} words</span>
          {suggestionsCount > 0 && (
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
              <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
              {suggestionsCount} issues
            </div>
          )}
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-white/90 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          Check Writing
        </button>
      </div>
    </header>
  );
};
