"use client";

import React from "react";
import { Check, X } from "lucide-react";

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
      className={`group relative flex flex-col gap-3 p-5 rounded-xl transition-all duration-200 cursor-pointer border shadow-sm
        ${isActive 
          ? "bg-white border-stone-900 shadow-md ring-1 ring-stone-900" 
          : "bg-white border-stone-200 hover:border-stone-400 hover:shadow-md"
        }`}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Quote Context */}
        <div className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded truncate max-w-[240px]">
          "{comment.quote}"
        </div>
        
        {/* Actions */}
        <button 
          onClick={(e) => { e.stopPropagation(); onDismiss(comment.id); }}
          className="text-stone-400 hover:text-stone-900 p-1 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message */}
      <p className="text-[15px] font-medium text-stone-900 leading-snug">
        {comment.message}
      </p>

      {/* Suggestion & Apply */}
      {isActive && (
        <div className="pt-2 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-[15px] text-stone-800">
            <span className="font-bold text-blue-600 mr-2">Try:</span>
            {comment.suggestion}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onApply(comment); }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-stone-900 text-white text-sm font-bold rounded-lg hover:bg-stone-800 transition-colors shadow-sm active:translate-y-px"
          >
            <Check className="w-4 h-4" />
            Accept Change
          </button>
        </div>
      )}
    </div>
  );
};
