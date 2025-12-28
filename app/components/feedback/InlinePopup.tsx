"use client";

import React from "react";
import { Check, X, CornerDownRight } from "lucide-react";
import { Comment } from "./SuggestionCard";

interface InlinePopupProps {
  comment: Comment;
  currentIndex: number;
  totalCount: number;
  onApply: (comment: Comment) => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
}

export const InlinePopup: React.FC<InlinePopupProps> = ({
  comment,
  currentIndex,
  totalCount,
  onApply,
  onDismiss,
  onClose,
}) => {
  return (
    <>
      {/* Backdrop - Transparent to see text underneath */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Popup - Wide & Logical Split */}
      <div
        className="fixed z-50 w-[800px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] text-white rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,1)] border border-white/10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden"
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
            <span>Issue {currentIndex} of {totalCount} • {comment.category}</span>
            <button onClick={onClose} className="hover:text-white transition-colors p-2 -mr-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Split Content */}
          <div className="grid grid-cols-2 gap-12 items-start">
            
            {/* LEFT: what you wrote */}
            <div className="space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                you wrote:
              </div>
              <div className="relative p-6 bg-white/5 border border-white/5 rounded-2xl min-h-[160px] flex items-center justify-center italic text-xl text-white/40 leading-relaxed text-center">
                "{comment.quote}"
              </div>
            </div>

            {/* RIGHT: Logic flow */}
            <div className="space-y-8">
              {/* Reason */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-rose-400/80">
                  reason:
                </div>
                <p className="text-xl font-bold leading-tight text-white/95">
                  {comment.message}
                </p>
              </div>

              {/* Suggestion */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  suggestion:
                </div>
                <div className="flex items-start gap-4 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                  <CornerDownRight className="w-6 h-6 text-indigo-500 mt-1 shrink-0 opacity-50" />
                  <p className="text-2xl font-medium leading-relaxed text-white">
                    {comment.suggestion}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <button
              onClick={() => onApply(comment)}
              className="flex-1 flex items-center justify-center gap-3 py-5 bg-white text-black text-base font-bold uppercase tracking-wider rounded-2xl hover:bg-white/90 transition-all active:scale-[0.98] shadow-2xl shadow-white/5"
            >
              <Check className="w-6 h-6" />
              Apply Fix
            </button>
            <button
              onClick={() => onDismiss(comment.id)}
              className="px-12 py-5 bg-white/5 text-white/50 text-base font-bold uppercase tracking-wider rounded-2xl hover:bg-white/10 hover:text-white transition-all"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
