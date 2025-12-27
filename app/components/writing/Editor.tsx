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
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="relative w-full h-full">
      <div className="relative min-h-[800px]">
        {/* Underline layer */}
        <div
          ref={highlightRef}
          className="absolute inset-0 whitespace-pre-wrap overflow-hidden pointer-events-none text-transparent"
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: '21px',
            lineHeight: '1.8',
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
              const styles = range.category ? getCategoryStyles(range.category) : { highlight: "bg-stone-100/60 border-stone-300" };
              
              parts.push(
                <mark
                  key={`h-${i}`}
                  onClick={() => onCommentClick(range.id)}
                  className={`
                    relative pointer-events-auto cursor-pointer transition-all duration-200
                    border-b-2
                    ${isActive 
                      ? "bg-stone-900/10 border-stone-900 shadow-[0_2px_0_0_#1c1917]" 
                      : `${styles.highlight} hover:bg-stone-900/5`}
                  `}
                  style={{ color: 'transparent' }}
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
          placeholder="Start writing your story..."
          className="relative w-full bg-transparent text-[#1a1a1a] resize-none outline-none placeholder:text-stone-300 p-0 border-none focus:ring-0 overflow-hidden"
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: '21px',
            lineHeight: '1.8',
            wordBreak: 'break-word',
            minHeight: '800px'
          }}
        />
      </div>
    </div>
  );
};
