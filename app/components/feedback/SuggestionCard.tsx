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

const getCategoryConfig = (category: CommentCategory) => {
  switch (category) {
    case "grammar":
    case "consistency":
      return { 
        color: "var(--cat-grammar)",
        softColor: "var(--cat-grammar-soft)",
      };
    case "clarity":
    case "logic":
    case "thesis":
      return { 
        color: "var(--cat-clarity)",
        softColor: "var(--cat-clarity-soft)",
      };
    case "style":
    case "tone":
      return { 
        color: "var(--cat-style)",
        softColor: "var(--cat-style-soft)",
      };
    case "structure":
    case "transitions":
    case "examples":
      return { 
        color: "var(--cat-structure)",
        softColor: "var(--cat-structure-soft)",
      };
    default:
      return { 
        color: "var(--text-muted)",
        softColor: "var(--bg-hover)",
      };
  }
};

// Export for Editor compatibility
export const getCategoryStyles = (category: CommentCategory) => {
  const config = getCategoryConfig(category);
  return {
    highlight: `bg-[hsl(${config.softColor})] border-[hsl(${config.color})]`,
  };
};

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  comment,
  isActive,
  onClick,
  onApply,
  onDismiss,
}) => {
  const config = getCategoryConfig(comment.category);

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-lg transition-smooth cursor-pointer overflow-hidden
        ${isActive 
          ? "bg-[hsl(var(--bg-elevated))] ring-1 ring-[hsl(var(--accent))]" 
          : "bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] hover:border-[hsl(var(--text-muted)/0.3)]"
        }`}
    >
      {/* Color indicator */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{ backgroundColor: `hsl(${config.color})` }}
      />
      
      <div className="p-3 pl-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span 
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: `hsl(${config.color})` }}
            >
              {comment.category}
            </span>
            {comment.impact === 'high' && (
              <span className="text-[9px] font-bold text-[hsl(var(--bg-deep))] bg-[hsl(var(--accent))] px-1.5 py-0.5 rounded uppercase tracking-wide">
                Important
              </span>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onDismiss(comment.id); }}
            className="text-[hsl(var(--text-faint))] hover:text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-smooth p-1 hover:bg-[hsl(var(--bg-hover))] rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Comment */}
        <p className={`text-[13px] leading-relaxed ${isActive ? "text-[hsl(var(--text-primary))]" : "text-[hsl(var(--text-secondary))]"}`}>
          {comment.comment}
        </p>

        {/* Expanded */}
        {isActive && comment.suggestion && (
          <div className="mt-3 space-y-3 animate-fade-up">
            <div 
              className="p-3 rounded-lg border"
              style={{ 
                backgroundColor: `hsl(${config.softColor})`,
                borderColor: `hsl(${config.color} / 0.3)`
              }}
            >
              <p 
                className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: `hsl(${config.color})` }}
              >
                Suggestion
              </p>
              <p 
                className="text-[14px] text-[hsl(var(--text-primary))] italic leading-relaxed"
                style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
              >
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
