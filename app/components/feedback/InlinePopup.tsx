"use client";

import React from "react";
import { Check, X, ArrowRight, Zap, Wind, Feather } from "lucide-react";
import { Comment, CommentCategory } from "./SuggestionCard";

interface InlinePopupProps {
  comment: Comment;
  position: { x: number; y: number };
  onApply: (comment: Comment) => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
}

const CategoryIcon = ({ category }: { category: CommentCategory }) => {
  switch (category) {
    case "grammar": return <Zap className="w-4 h-4" />;
    case "clarity": return <Wind className="w-4 h-4" />;
    case "style": return <Feather className="w-4 h-4" />;
    default: return <Feather className="w-4 h-4" />;
  }
};

export const InlinePopup: React.FC<InlinePopupProps> = ({
  comment,
  position,
  onApply,
  onDismiss,
  onClose,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Popup */}
      <div
        className="fixed z-50 w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          left: Math.min(position.x, window.innerWidth - 340),
          top: position.y + 10,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
            <CategoryIcon category={comment.category} />
            {comment.category}
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Message */}
          <p className="text-base font-semibold text-stone-900 leading-snug">
            {comment.message}
          </p>

          {/* Quote */}
          <div className="text-xs text-stone-400 border-l-2 border-stone-200 pl-3 italic">
            "{comment.quote}"
          </div>

          {/* Suggestion */}
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
              Suggested fix
            </div>
            <p className="text-sm text-stone-800 font-medium">
              {comment.suggestion}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { onApply(comment); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all"
            >
              <Check className="w-4 h-4" />
              Apply
            </button>
            <button
              onClick={() => { onDismiss(comment.id); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-100 text-stone-600 text-sm font-bold rounded-xl hover:bg-stone-200 transition-all"
            >
              <X className="w-4 h-4" />
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

