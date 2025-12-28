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
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />

      {/* Popup - Smaller and more focused */}
      <div
        className="fixed z-50 w-[420px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] text-white rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden"
      >
        {/* Progress indicator line at the very top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${(currentIndex / totalCount) * 100}%` }} 
          />
        </div>

        <div className="p-6 space-y-6">
          {/* Header & Reason */}
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400/80">
                {comment.category} • Issue {currentIndex} of {totalCount}
              </div>
              <h3 className="text-base font-bold leading-snug text-white/95">
                {comment.message}
              </h3>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/20 hover:text-white transition-colors p-1 -mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* The Edit Card */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3">
            <div className="text-sm text-white/30 line-through decoration-white/10 italic leading-relaxed">
              "{comment.quote}"
            </div>
            <div className="flex items-start gap-2.5 text-white/95">
              <CornerDownRight className="w-3.5 h-3.5 text-indigo-500 mt-1 shrink-0 opacity-50" />
              <p className="text-base font-medium leading-relaxed">
                {comment.suggestion}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={() => onApply(comment)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              Apply Fix
            </button>
            <button
              onClick={() => onDismiss(comment.id)}
              className="px-6 py-3 bg-white/5 text-white/50 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
