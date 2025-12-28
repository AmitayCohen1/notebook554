"use client";

import React from "react";
import { Check, X, ArrowRight, Wand2, Zap, Wind, Feather } from "lucide-react";

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

const getCategoryStyles = (category: CommentCategory) => {
  switch (category) {
    case "grammar":
      return { icon: Zap, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100", accent: "text-rose-600" };
    case "clarity":
      return { icon: Wind, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100", accent: "text-blue-600" };
    case "style":
      return { icon: Feather, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100", accent: "text-purple-600" };
    default:
      return { icon: Wand2, color: "text-stone-500", bg: "bg-stone-50", border: "border-stone-100", accent: "text-stone-600" };
  }
};

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  comment,
  isActive,
  onClick,
  onApply,
  onDismiss,
}) => {
  const styles = getCategoryStyles(comment.category);
  const Icon = styles.icon;

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col gap-3 p-5 rounded-2xl transition-all duration-300 cursor-pointer border
        ${isActive 
          ? "bg-white border-stone-900 shadow-[0_8px_30px_rgba(0,0,0,0.08)] scale-[1.02] ring-1 ring-stone-900/5 z-10" 
          : "bg-white border-stone-100 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50 hover:-translate-y-0.5"
        }`}
    >
      {/* Header: Quote + Dismiss */}
      <div className="flex justify-between items-start gap-4">
        <div className={`pl-2.5 border-l-[3px] ${styles.border.replace('bg-', 'border-')} text-xs text-stone-400 font-medium italic truncate max-w-[240px]`}>
          "{comment.quote}"
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onDismiss(comment.id); }}
          className="text-stone-300 hover:text-stone-900 p-1 -mt-1 -mr-1 rounded-full hover:bg-stone-100 transition-all opacity-0 group-hover:opacity-100"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message / Feedback */}
      <div className="flex gap-3 mt-1">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${styles.bg} mt-0.5`}>
          <Icon className={`w-3.5 h-3.5 ${styles.color}`} />
        </div>
        <div className="text-[15px] font-bold text-stone-900 leading-snug pt-0.5">
          {comment.message}
        </div>
      </div>

      {/* Suggestion & Apply */}
      {isActive && (
        <div className="pt-2 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200 pl-9">
          <div className={`p-3 rounded-xl border ${styles.bg} ${styles.border}`}>
            <p className="text-[14px] text-stone-800 font-medium leading-relaxed">
              {comment.suggestion}
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onApply(comment); }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-stone-900 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-sm active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5" />
            Accept Fix
          </button>
        </div>
      )}
      
      {/* Peek when inactive */}
      {!isActive && (
        <div className={`flex items-center gap-2 text-xs font-medium ${styles.accent} pl-9 pt-1 opacity-80`}>
          <span>View suggestion</span>
          <ArrowRight className="w-3 h-3 ml-auto text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
};
