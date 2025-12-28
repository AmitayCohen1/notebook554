"use client";

import React from "react";
import { Check, X, Zap, Wind, Feather, ChevronRight } from "lucide-react";
import { Comment, CommentCategory } from "./SuggestionCard";

interface InlinePopupProps {
  comment: Comment;
  position: { x: number; y: number };
  currentIndex: number;
  totalCount: number;
  onApply: (comment: Comment) => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
}

const CategoryIcon = ({ category }: { category: CommentCategory }) => {
  switch (category) {
    case "grammar": return <Zap className="w-5 h-5" />;
    case "clarity": return <Wind className="w-5 h-5" />;
    case "style": return <Feather className="w-5 h-5" />;
    default: return <Feather className="w-5 h-5" />;
  }
};

const categoryColors = {
  grammar: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
  clarity: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  style: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
};

export const InlinePopup: React.FC<InlinePopupProps> = ({
  comment,
  position,
  currentIndex,
  totalCount,
  onApply,
  onDismiss,
  onClose,
}) => {
  const isLast = currentIndex >= totalCount;
  const colors = categoryColors[comment.category] || categoryColors.style;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]" 
        onClick={onClose}
      />
      
      {/* Popup - Centered and Large */}
      <div
        className="fixed z-50 w-[480px] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 ${colors.bg} border-b ${colors.border}`}>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${colors.text}`}>
              <CategoryIcon category={comment.category} />
              {comment.category}
            </div>
            <div className="text-sm font-medium text-stone-400 bg-white/50 px-2 py-0.5 rounded-full">
              {currentIndex} of {totalCount}
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 p-2 rounded-xl hover:bg-white/50 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Message - The Main Event */}
          <p className="text-2xl font-bold text-stone-900 leading-snug">
            {comment.message}
          </p>

          {/* Quote */}
          <div className="text-base text-stone-500 border-l-4 border-stone-200 pl-4 py-2 bg-stone-50 rounded-r-xl">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Original</span>
            "{comment.quote}"
          </div>

          {/* Suggestion */}
          <div className={`p-5 ${colors.bg} rounded-2xl border ${colors.border}`}>
            <div className={`text-xs font-bold ${colors.text} uppercase tracking-wider mb-2`}>
              Replace with
            </div>
            <p className="text-xl text-stone-900 font-medium leading-relaxed">
              {comment.suggestion}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onApply(comment)}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-stone-900 text-white text-base font-bold rounded-2xl hover:bg-black transition-all active:scale-[0.98] shadow-lg"
            >
              <Check className="w-5 h-5" />
              Apply Fix
              {!isLast && <ChevronRight className="w-5 h-5 ml-2" />}
            </button>
            <button
              onClick={() => onDismiss(comment.id)}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-stone-100 text-stone-700 text-base font-bold rounded-2xl hover:bg-stone-200 transition-all active:scale-[0.98]"
            >
              Skip
              {!isLast && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
