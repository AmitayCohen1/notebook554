"use client";

import React, { useRef, useEffect } from "react";
import { getCategoryStyles, CommentCategory } from "../feedback/SuggestionCard";

interface Range {
  start: number;
  end: number;
  id: string;
  category?: CommentCategory;
}

interface EditorProps {
  content: string;
  setContent: (content: string) => void;
  highlightRanges: Range[];
  activeCommentId: string | null;
  onCommentClick: (id: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  setContent,
  highlightRanges,
  activeCommentId,
  onCommentClick,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 600)}px`;
    }
  }, [content]);

  return (
    <div className="relative w-full">
      <div className="relative" style={{ minHeight: '600px' }}>
        {/* Highlight underlay layer */}
        <div
          ref={highlightRef}
          className="absolute inset-0 whitespace-pre-wrap overflow-hidden pointer-events-none text-transparent"
          style={{
            fontFamily: 'var(--font-serif), Georgia, serif',
            fontSize: '18px',
            lineHeight: '1.9',
            letterSpacing: '0.01em',
            wordBreak: 'break-word',
          }}
          aria-hidden="true"
        >
          {(() => {
            const parts: React.ReactNode[] = [];
            let lastEnd = 0;
            const sortedRanges = [...highlightRanges].sort((a, b) => a.start - b.start);

            sortedRanges.forEach((range, i) => {
              if (range.start > lastEnd) {
                parts.push(content.substring(lastEnd, range.start));
              }
              
              const isActive = activeCommentId === range.id;
              
              // Get category-specific colors
              let highlightColor = "var(--warm-200)";
              let borderColor = "var(--warm-400)";
              
              if (range.category) {
                switch (range.category) {
                  case "grammar":
                  case "consistency":
                    highlightColor = "var(--category-grammar-soft)";
                    borderColor = "var(--category-grammar)";
                    break;
                  case "clarity":
                  case "logic":
                  case "thesis":
                    highlightColor = "var(--category-clarity-soft)";
                    borderColor = "var(--category-clarity)";
                    break;
                  case "style":
                  case "tone":
                    highlightColor = "var(--category-style-soft)";
                    borderColor = "var(--category-style)";
                    break;
                  case "structure":
                  case "transitions":
                  case "examples":
                    highlightColor = "var(--category-structure-soft)";
                    borderColor = "var(--category-structure)";
                    break;
                }
              }
              
              parts.push(
                <mark
                  key={`h-${i}`}
                  onClick={() => onCommentClick(range.id)}
                  className="relative pointer-events-auto cursor-pointer transition-all duration-200 rounded-sm"
                  style={{ 
                    color: 'transparent',
                    backgroundColor: isActive 
                      ? `hsl(${borderColor}/0.15)` 
                      : `hsl(${highlightColor})`,
                    borderBottom: `2px solid hsl(${borderColor}${isActive ? '' : '/0.5'})`,
                    boxShadow: isActive 
                      ? `0 2px 0 0 hsl(${borderColor})` 
                      : 'none',
                  }}
                >
                  {content.substring(range.start, range.end)}
                </mark>
              );
              lastEnd = range.end;
            });

            if (lastEnd < content.length) {
              parts.push(content.substring(lastEnd));
            }
            return parts;
          })()}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="relative w-full bg-transparent text-[hsl(var(--warm-800))] resize-none outline-none p-0 border-none focus:ring-0 overflow-hidden"
          style={{
            fontFamily: 'var(--font-serif), Georgia, serif',
            fontSize: '18px',
            lineHeight: '1.9',
            letterSpacing: '0.01em',
            wordBreak: 'break-word',
            minHeight: '600px',
            caretColor: 'hsl(var(--accent-primary))',
          }}
        />
        
        {/* Placeholder styling */}
        {!content && (
          <div 
            className="absolute top-0 left-0 pointer-events-none text-[hsl(var(--warm-300))]"
            style={{
              fontFamily: 'var(--font-serif), Georgia, serif',
              fontSize: '18px',
              lineHeight: '1.9',
              letterSpacing: '0.01em',
            }}
          >
            Start writing...
          </div>
        )}
      </div>
    </div>
  );
};
