"use client";

import React from "react";
import { Check, X, CornerDownRight } from "lucide-react";
import { Comment } from "./SuggestionCard";

interface InlinePopupProps {
  comment: Comment;
  position: { x: number; y: number };
  currentIndex: number;
  totalCount: number;
  onApply: (comment: Comment) => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
}

export const InlinePopup: React.FC<InlinePopupProps> = ({
  comment,
  position,
  currentIndex,
  totalCount,
  onApply,
  onDismiss,
  onClose,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* The anchored tool */}
      <div
        className="fixed z-50 w-[440px] bg-[#0a0a0a] text-white rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] border border-white/10 animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden transition-all"
        style={{
          left: Math.min(Math.max(position.x - 220, 20), window.innerWidth - 460),
          top: Math.min(Math.max(position.y + 16, 80), window.innerHeight - 450),
        }}
      >
        {/* Progress indicator line at the very top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${(currentIndex / totalCount) * 100}%` }} 
          />
        </div>

        <div className="p-6 space-y-6">
          {/* Header Row */}
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            <span>Issue {currentIndex} of {totalCount}</span>
            <button onClick={onClose} className="hover:text-white transition-colors p-1 -mr-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5">
            {/* 1. you wrote: */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                you wrote:
              </div>
              <div className="text-[15px] text-white/40 italic leading-relaxed">
                "{comment.quote}"
              </div>
            </div>

            {/* 2. issue: */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-rose-400/80 uppercase tracking-widest">
                issue:
              </div>
              <p className="text-[17px] font-semibold leading-tight text-white/95">
                {comment.message}
              </p>
            </div>

            {/* 3. suggestion: */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                suggestion:
              </div>
              <div className="flex items-start gap-3">
                <CornerDownRight className="w-4 h-4 text-indigo-500 mt-1.5 shrink-0 opacity-50" />
                <p className="text-[17px] font-medium leading-relaxed text-white">
                  {comment.suggestion}
                </p>
              </div>
            </div>

            {/* 4. kind of: */}
            <div className="pt-2 border-t border-white/5 flex items-center gap-2">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                kind of:
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/80">
                {comment.category}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onApply(comment)}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-indigo-600 text-white text-[13px] font-bold uppercase tracking-wider rounded-xl hover:bg-indigo-500 hover:scale-[1.02] transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20"
            >
              <Check className="size-4" />
              Apply Fix
            </button>
            <button
              onClick={() => onDismiss(comment.id)}
              className="px-8 py-4 bg-white/5 text-white/50 text-[13px] font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
