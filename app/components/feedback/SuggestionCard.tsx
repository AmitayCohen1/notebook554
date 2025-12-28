"use client";

import React from "react";
import { Check, X } from "lucide-react";

export interface Comment {
  id: string;
  quote: string;
  message: string;
  suggestion: string; // Strictly required now
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
      className={`group relative flex flex-col gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer border
        ${isActive 
          ? "bg-white border-black shadow-md scale-[1.01]" 
          : "bg-white border-[hsl(var(--border))] hover:border-[hsl(var(--text-tertiary))]"
        }`}
    >
      {/* Header: Quote + Dismiss */}
      <div className="flex justify-between items-start">
        <div className="text-xs font-mono text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-app))] px-1.5 py-0.5 rounded truncate max-w-[200px]">
          "{comment.quote}"
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDismiss(comment.id); }}
          className="text-[hsl(var(--text-tertiary))] hover:text-black p-1 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message */}
      <p className="text-sm font-medium text-[hsl(var(--text-primary))] leading-snug">
        {comment.message}
      </p>

      {/* Action Area (Always visible if active, or peek if inactive) */}
      {isActive && (
        <div className="pt-2 flex flex-col gap-2 animate-slide-in">
          <div className="p-3 bg-[hsl(var(--bg-app))] rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] font-serif italic">
            {comment.suggestion}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onApply(comment); }}
            className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-[hsl(var(--accent-hover))] transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Accept Change
          </button>
        </div>
      )}
    </div>
  );
};
