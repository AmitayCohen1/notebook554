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
    <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 bg-white border-b border-stone-200">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2 px-2 mr-4">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <PenLine className="w-5 h-5" />
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[15px] text-stone-900 leading-tight">Untitled Document</span>
            <div className="px-1.5 py-0.5 rounded border border-stone-200 text-[10px] text-stone-400 font-bold uppercase tracking-tight">Draft</div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-400 mt-0.5 font-medium">
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Insert</span>
            <span>Format</span>
            <span>Tools</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-[11px] font-medium text-stone-500 bg-stone-50 px-3 py-1.5 rounded-md border border-stone-100">
          <span className="tabular-nums">{wordCount} words</span>
          {hasAnalyzed && (
            <>
              <div className="h-3 w-px bg-stone-200" />
              <span className="font-bold text-stone-900">{suggestionsCount} issues</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-1.5 bg-[#c2e7ff] text-[#001d35] text-sm font-semibold rounded-full hover:shadow-md transition-all">
            <Share className="w-4 h-4" />
            Share
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-stone-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
