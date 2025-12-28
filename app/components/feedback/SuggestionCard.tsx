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
      className={`group relative flex flex-col transition-all duration-300 cursor-pointer border-b border-white/5 last:border-0
        ${isActive 
          ? "bg-white/5 px-6 py-8 -mx-6 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] ring-1 ring-white/10" 
          : "px-0 py-6 hover:bg-white/5 hover:px-4 hover:-mx-4 hover:rounded-xl"
        }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-indigo-400" : "text-white/30"}`}>
          <CategoryIcon category={comment.category} />
          {comment.category}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDismiss(comment.id); }}
          className="text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className={`transition-all duration-200 ${isActive ? "text-xl font-bold text-white mb-6" : "text-sm text-white/70 font-medium"}`}>
        {comment.message}
      </div>

      {isActive && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 shadow-sm">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Change to:</div>
            <div className="text-base font-medium text-white/90 leading-relaxed">
              {comment.suggestion}
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onApply(comment); }}
            className="flex items-center justify-between w-full px-6 py-3 bg-white text-black rounded-xl hover:bg-white/90 transition-all shadow-lg active:scale-95"
          >
            <span className="text-sm font-bold">Apply fix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
