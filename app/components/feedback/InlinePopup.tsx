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
        className="fixed z-50 w-[640px] bg-[#0a0a0a] text-white rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,1)] border border-white/10 animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden transition-all"
        style={{
          left: Math.min(Math.max(position.x - 320, 20), window.innerWidth - 660),
          top: Math.min(Math.max(position.y + 20, 80), window.innerHeight - 550),
        }}
      >
        {/* Progress indicator line at the very top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${(currentIndex / totalCount) * 100}%` }} 
          />
        </div>

        <div className="p-10 space-y-8">
          {/* Header Row */}
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.3em] text-white/30">
            <span>Issue {currentIndex} of {totalCount}</span>
            <button onClick={onClose} className="hover:text-white transition-colors p-2 -mr-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* 1. you wrote: */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                you wrote:
              </div>
              <div className="text-lg text-white/40 italic leading-relaxed">
                "{comment.quote}"
              </div>
            </div>

            {/* 2. issue: */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-rose-400/80 uppercase tracking-widest">
                issue:
              </div>
              <p className="text-2xl font-bold leading-tight text-white/95">
                {comment.message}
              </p>
            </div>

            {/* 3. suggestion: */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                suggestion:
              </div>
              <div className="flex items-start gap-4">
                <CornerDownRight className="w-6 h-6 text-indigo-500 mt-1 shrink-0 opacity-50" />
                <p className="text-2xl font-medium leading-relaxed text-white">
                  {comment.suggestion}
                </p>
              </div>
            </div>

            {/* 4. kind of: */}
            <div className="pt-4 border-t border-white/5 flex items-center gap-3">
              <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                kind of:
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                {comment.category}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={() => onApply(comment)}
              className="flex-1 flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white text-base font-bold uppercase tracking-wider rounded-2xl hover:bg-indigo-500 hover:scale-[1.02] transition-all active:scale-[0.98] shadow-2xl shadow-indigo-600/30"
            >
              <Check className="w-6 h-6" />
              Apply Fix
            </button>
            <button
              onClick={() => onDismiss(comment.id)}
              className="px-10 py-5 bg-white/5 text-white/50 text-base font-bold uppercase tracking-wider rounded-2xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
