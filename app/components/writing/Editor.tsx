"use client";

import React, { useRef, useEffect } from "react";

interface Range {
  start: number;
  end: number;
  id: string;
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 500)}px`;
    }
  }, [content]);

  return (
    <div className="relative w-full" style={{ minHeight: '500px' }}>
      {/* Highlight layer */}
      <div
        className="absolute inset-0 whitespace-pre-wrap overflow-hidden pointer-events-none"
        style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontSize: '22px',
          lineHeight: '1.75',
          letterSpacing: '0.01em',
          wordBreak: 'break-word',
          color: 'transparent',
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
            const colors = { bg: "var(--bg-hover)", border: "var(--accent)" };
            
            parts.push(
              <mark
                key={`h-${i}`}
                onClick={() => onCommentClick(range.id)}
                className="highlight-mark pointer-events-auto cursor-pointer"
                style={{ 
                  color: 'transparent',
                  backgroundColor: `hsl(${colors.bg})`,
                  borderBottom: `2px solid hsl(${colors.border})`,
                  opacity: isActive ? 1 : 0.7,
                  boxShadow: isActive ? `0 0 12px hsl(${colors.border} / 0.4)` : 'none',
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

      {/* Textarea - the writing surface */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        className="relative w-full bg-transparent resize-none outline-none p-0 border-none focus:ring-0 overflow-hidden placeholder:text-[hsl(var(--text-faint))]"
        style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontSize: '22px',
          lineHeight: '1.75',
          letterSpacing: '0.01em',
          wordBreak: 'break-word',
          minHeight: '500px',
          color: 'hsl(var(--text-writing))',
          caretColor: 'hsl(var(--accent))',
        }}
      />
    </div>
  );
};
