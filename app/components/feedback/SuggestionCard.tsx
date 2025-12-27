"use client";

import React from "react";
import { Check, X } from "lucide-react";

export type CommentKind = "insert" | "rewrite" | "praise";
export type CommentCategory = "thesis" | "structure" | "clarity" | "logic" | "transitions" | "examples" | "tone" | "style" | "consistency" | "grammar";
export type CommentImpact = "low" | "medium" | "high";

export interface Comment {
  id: string;
  original_text: string;
  comment: string;
  suggestion: string | null;
  kind: CommentKind;
  category: CommentCategory;
  impact: CommentImpact;
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

export const getCategoryStyles = (category: CommentCategory) => {
  switch (category) {
    case "grammar":
    case "consistency":
      return { 
        bg: "bg-rose-50/30", 
        text: "text-rose-700", 
        border: "border-rose-200", 
        badge: "bg-rose-100/50 text-rose-700",
        highlight: "bg-rose-100/40 border-rose-300"
      };
    case "clarity":
    case "logic":
    case "thesis":
      return { 
        bg: "bg-blue-50/30", 
        text: "text-blue-700", 
        border: "border-blue-200", 
        badge: "bg-blue-100/50 text-blue-700",
        highlight: "bg-blue-100/40 border-blue-300"
      };
    case "style":
    case "tone":
      return { 
        bg: "bg-emerald-50/30", 
        text: "text-emerald-700", 
        border: "border-emerald-200", 
        badge: "bg-emerald-100/50 text-emerald-700",
        highlight: "bg-emerald-100/40 border-emerald-300"
      };
    case "structure":
    case "transitions":
    case "examples":
      return { 
        bg: "bg-amber-50/30", 
        text: "text-amber-700", 
        border: "border-amber-200", 
        badge: "bg-amber-100/50 text-amber-700",
        highlight: "bg-amber-100/40 border-amber-300"
      };
    default:
      return { 
        bg: "bg-stone-50/30", 
        text: "text-stone-700", 
        border: "border-stone-200", 
        badge: "bg-stone-100/50 text-stone-700",
        highlight: "bg-stone-100/40 border-stone-300"
      };
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

  return (
    <div
      onClick={onClick}
      className={`group flex relative flex-col border border-stone-200 rounded-lg transition-all cursor-pointer overflow-hidden
        ${isActive ? "bg-white ring-2 ring-stone-900 shadow-lg" : "bg-white hover:border-stone-300 hover:shadow-sm"}`}
    >
      {/* Small side color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.badge.split(' ')[0]}`} />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${styles.badge}`}>
              {comment.category}
            </span>
            {comment.impact === 'high' && (
              <span className="text-[9px] font-black text-white bg-stone-900 px-1.5 py-0.5 rounded uppercase tracking-widest">
                Critical
              </span>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onDismiss(comment.id); }}
            className="text-stone-300 hover:text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className={`text-[14px] leading-relaxed font-medium mb-3 ${isActive ? "text-stone-900" : "text-stone-600"}`}>
          {comment.comment}
        </p>

        {isActive && comment.suggestion && (
          <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className={`p-3 bg-stone-50 border ${styles.border} rounded-md`}>
              <p className={`text-[9px] font-black mb-1.5 uppercase tracking-widest ${styles.text}`}>Revision</p>
              <p className="text-[15px] text-stone-900 italic font-serif leading-relaxed">
                {comment.suggestion}
              </p>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); onApply(comment); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-stone-900 text-white rounded-md text-xs font-bold hover:bg-stone-800 transition-all active:scale-[0.97]"
            >
              <Check className="w-3.5 h-3.5" />
              Replace text
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
