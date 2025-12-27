"use client";

import React from "react";
import { Search, Share, MoreHorizontal, PenLine } from "lucide-react";

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
    <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white border-b border-stone-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2">
          <PenLine className="w-5 h-5 text-stone-900" />
          <span className="font-semibold text-sm tracking-tight">WriteGuide</span>
        </div>
        
        <div className="h-4 w-[1px] bg-stone-200 hidden sm:block" />
        
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-medium text-stone-500">Untitled Document</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-stone-500">
          <span className="text-[11px] font-medium tracking-tight">
            {wordCount} words
          </span>
          {hasAnalyzed && (
            <>
              <div className="h-3 w-[1px] bg-stone-200" />
              <span className="text-[11px] font-semibold text-stone-900">
                {suggestionsCount} issues
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-stone-500 hover:bg-stone-100 rounded-md transition-colors">
            <Share className="w-4 h-4" />
          </button>
          <button className="p-2 text-stone-500 hover:bg-stone-100 rounded-md transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <div className="ml-2 px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-md hover:bg-stone-800 transition-colors cursor-pointer">
            Export
          </div>
        </div>
      </div>
    </header>
  );
};
