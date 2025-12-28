"use client";

import React from "react";
import { Check, X, Quote, ArrowRight, Wand2 } from "lucide-react";

export interface Comment {
  id: string;
  quote: string;
  message: string;
  suggestion: string;
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
      className={`group relative flex flex-col gap-4 p-6 rounded-2xl transition-all duration-300 cursor-pointer border
        ${isActive 
          ? "bg-white border-stone-900 shadow-[0_8px_30px_rgba(0,0,0,0.08)] scale-[1.02] ring-1 ring-stone-900/5 z-10" 
          : "bg-white border-stone-100 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50 hover:-translate-y-0.5"
        }`}
    >
      {/* Header: Quote Context */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
          <Quote className="w-3 h-3" />
          <span>Context</span>
        </div>
        
        {/* Dismiss Action */}
        <button 
          onClick={(e) => { e.stopPropagation(); onDismiss(comment.id); }}
          className="text-stone-300 hover:text-stone-900 p-1.5 -mt-2 -mr-2 rounded-full hover:bg-stone-100 transition-all opacity-0 group-hover:opacity-100"
          title="Dismiss suggestion"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* The Quote itself */}
      <div className="pl-3 border-l-2 border-stone-200 text-sm text-stone-500 font-medium italic truncate">
        "{comment.quote}"
      </div>

      {/* Message / Feedback */}
      <div className="text-[16px] font-semibold text-stone-900 leading-snug">
        {comment.message}
      </div>

      {/* Suggestion & Apply - Only visible when active */}
      {isActive && (
        <div className="pt-2 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Visual Diff / Suggestion Box */}
          <div className="relative p-4 bg-stone-50 rounded-xl border border-stone-100 group-hover:border-stone-200 transition-colors">
            <div className="absolute -top-2.5 left-3 bg-white px-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest border border-stone-100 rounded-full">
              Suggestion
            </div>
            <div className="flex items-start gap-3">
              <Wand2 className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <p className="text-[15px] text-stone-800 font-medium leading-relaxed">
                {comment.suggestion}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onApply(comment); }}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-stone-900 text-white text-[14px] font-bold rounded-xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-stone-900/10"
          >
            <Check className="w-4 h-4" />
            Apply Fix
          </button>
        </div>
      )}
      
      {/* Peek of suggestion when inactive */}
      {!isActive && (
        <div className="flex items-center gap-2 text-xs font-medium text-stone-400 pt-1">
          <Wand2 className="w-3 h-3" />
          <span>Click to review suggestion</span>
          <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
};
