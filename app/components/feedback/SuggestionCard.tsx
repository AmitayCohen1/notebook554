"use client";

import React from "react";
import { Check, X } from "lucide-react";

export interface Comment {
  id: string;
  quote: string;
  message: string;
  suggestion: string | null;
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
      className={`group relative rounded-lg transition-smooth cursor-pointer overflow-hidden
        ${isActive 
          ? "bg-[hsl(var(--bg-elevated))] ring-1 ring-[hsl(var(--accent))]" 
          : "bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] hover:border-[hsl(var(--text-muted)/0.3)]"
        }`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: `hsl(var(--accent))` }} />
      
      <div className="p-3 pl-4">
        {/* Header with quote preview */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-[hsl(var(--text-muted))] truncate max-w-[200px] font-mono">
            "{comment.quote.slice(0, 30)}{comment.quote.length > 30 ? "..." : ""}"
          </p>
          <button 
            onClick={(e) => { e.stopPropagation(); onDismiss(comment.id); }}
            className="text-[hsl(var(--text-faint))] hover:text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-smooth p-1 hover:bg-[hsl(var(--bg-hover))] rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Message */}
        <p className={`text-[13px] leading-relaxed ${isActive ? "text-[hsl(var(--text-primary))]" : "text-[hsl(var(--text-secondary))]"}`}>
          {comment.message}
        </p>

        {/* Suggestion (when active) */}
        {isActive && comment.suggestion && (
          <div className="mt-3 space-y-3 animate-fade-up">
            <div 
              className="p-3 rounded-lg border"
              style={{ 
                backgroundColor: `hsl(var(--accent-soft))`,
                borderColor: `hsl(var(--accent) / 0.3)`
              }}
            >
              <p className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: `hsl(var(--accent))` }}>
                Suggestion
              </p>
              <p className="text-[14px] text-[hsl(var(--text-primary))] italic leading-relaxed" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
                "{comment.suggestion}"
              </p>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); onApply(comment); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[hsl(var(--accent))] text-[hsl(var(--bg-deep))] rounded-lg text-xs font-semibold hover:brightness-110 transition-smooth active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5" />
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
