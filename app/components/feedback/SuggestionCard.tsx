"use client";

import React from "react";
import { Check, X, ArrowRight, Zap, Wind, Feather, Wand2 } from "lucide-react";

export type CommentCategory = "grammar" | "clarity" | "style";

export interface Comment {
  id: string;
  quote: string;
  message: string;
  suggestion: string;
  category: CommentCategory;
  startIndex: number;
  endIndex: number;
}

interface SuggestionCardProps {
  comment: Comment;
  isActive: boolean;
  onClick: () => void;
  onApply: (comment: Comment) => void;
  onDismiss: (id: string) => void;
}

const CategoryIcon = ({ category }: { category: CommentCategory }) => {
  switch (category) {
    case "grammar": return <Zap className="w-3.5 h-3.5" />;
    case "clarity": return <Wind className="w-3.5 h-3.5" />;
    case "style": return <Feather className="w-3.5 h-3.5" />;
    default: return <Wand2 className="w-3.5 h-3.5" />;
  }
};

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  comment,
  isActive,
  onClick,
  onApply,
  onDismiss,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col transition-all duration-200 cursor-pointer border-b border-stone-100 last:border-0
        ${isActive ? "bg-stone-50/80 px-6 py-8 -mx-6" : "px-0 py-5 hover:bg-stone-50/50"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-indigo-600" : "text-stone-400"}`}>
          <CategoryIcon category={comment.category} />
          {comment.category}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDismiss(comment.id); }}
          className="text-stone-300 hover:text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className={`transition-all duration-200 ${isActive ? "text-xl font-bold text-stone-900 mb-6" : "text-sm text-stone-600 font-medium"}`}>
        {comment.message}
      </div>

      {isActive && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Change to:</div>
            <div className="text-base font-medium text-stone-900 leading-relaxed">
              {comment.suggestion}
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onApply(comment); }}
            className="flex items-center justify-between w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-stone-800 transition-all shadow-lg active:scale-95"
          >
            <span className="text-sm font-bold">Apply fix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
