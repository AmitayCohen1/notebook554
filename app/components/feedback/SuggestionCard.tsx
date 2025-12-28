"use client";

import React from "react";
import { Check, X, AlertCircle, Lightbulb, Palette, Layout } from "lucide-react";

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
        label: category,
        color: "var(--category-grammar)",
        softColor: "var(--category-grammar-soft)",
        icon: AlertCircle,
        highlight: "hsl(var(--category-grammar-soft)) hsl(var(--category-grammar))"
      };
    case "clarity":
    case "logic":
    case "thesis":
      return { 
        label: category,
        color: "var(--category-clarity)",
        softColor: "var(--category-clarity-soft)",
        icon: Lightbulb,
        highlight: "hsl(var(--category-clarity-soft)) hsl(var(--category-clarity))"
      };
    case "style":
    case "tone":
      return { 
        label: category,
        color: "var(--category-style)",
        softColor: "var(--category-style-soft)",
        icon: Palette,
        highlight: "hsl(var(--category-style-soft)) hsl(var(--category-style))"
      };
    case "structure":
    case "transitions":
    case "examples":
      return { 
        label: category,
        color: "var(--category-structure)",
        softColor: "var(--category-structure-soft)",
        icon: Layout,
        highlight: "hsl(var(--category-structure-soft)) hsl(var(--category-structure))"
      };
    default:
      return { 
        label: category,
        color: "var(--warm-500)",
        softColor: "var(--warm-100)",
        icon: Lightbulb,
        highlight: "hsl(var(--warm-100)) hsl(var(--warm-500))"
      };
  }
};

// Export for Editor component to use
export const getCategoryStyles = (category: CommentCategory) => {
  const config = getCategoryConfig(category);
  return {
    bg: `bg-[hsl(${config.softColor})]`,
    text: `text-[hsl(${config.color})]`,
    border: `border-[hsl(${config.color}/0.3)]`,
    badge: `bg-[hsl(${config.softColor})] text-[hsl(${config.color})]`,
    highlight: `bg-[hsl(${config.softColor})] border-[hsl(${config.color}/0.4)]`,
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
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl transition-smooth cursor-pointer overflow-hidden
        ${isActive 
          ? "bg-[hsl(var(--surface-0))] ring-2 ring-[hsl(var(--accent-primary))] card-shadow-hover" 
          : "bg-[hsl(var(--surface-0))] border border-[hsl(var(--border))] hover:border-[hsl(var(--warm-300))] card-shadow hover:card-shadow-hover"
        }`}
    >
      {/* Category color accent */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: `hsl(${config.color})` }}
      />
      
      <div className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ backgroundColor: `hsl(${config.softColor})` }}
            >
              <Icon className="w-3 h-3" style={{ color: `hsl(${config.color})` }} />
            </div>
            <span 
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: `hsl(${config.color})` }}
            >
              {comment.category}
            </span>
            {comment.impact === 'high' && (
              <span className="text-[9px] font-bold text-white bg-[hsl(var(--accent-primary))] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Important
              </span>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onDismiss(comment.id); }}
            className="text-[hsl(var(--warm-300))] hover:text-[hsl(var(--warm-600))] opacity-0 group-hover:opacity-100 transition-smooth p-1 hover:bg-[hsl(var(--warm-100))] rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Comment text */}
        <p className={`text-[13px] leading-relaxed transition-colors
          ${isActive ? "text-[hsl(var(--warm-800))] font-medium" : "text-[hsl(var(--warm-600))]"}`}
        >
          {comment.comment}
        </p>

        {/* Expanded content when active */}
        {isActive && comment.suggestion && (
          <div className="mt-4 space-y-3 animate-fade-in">
            {/* Suggestion box */}
            <div 
              className="p-3.5 rounded-lg border"
              style={{ 
                backgroundColor: `hsl(${config.softColor})`,
                borderColor: `hsl(${config.color}/0.2)`
              }}
            >
              <p 
                className="text-[10px] font-bold mb-2 uppercase tracking-wider"
                style={{ color: `hsl(${config.color})` }}
              >
                Suggested revision
              </p>
              <p 
                className="text-[14px] text-[hsl(var(--warm-800))] italic leading-relaxed"
                style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
              >
                "{comment.suggestion}"
              </p>
            </div>
            
            {/* Apply button */}
            <button
              onClick={(e) => { e.stopPropagation(); onApply(comment); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-primary-hover))] text-white rounded-lg text-xs font-semibold hover:shadow-md transition-smooth active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5" />
              Apply suggestion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
