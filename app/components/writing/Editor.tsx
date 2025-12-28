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

  // Auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 600)}px`;
    }
  }, [content]);

  // Build highlighted content layer
  const renderHighlights = () => {
    if (highlightRanges.length === 0) return content;

    const parts: React.ReactNode[] = [];
    let lastEnd = 0;
    
    // Sort and ensure safe ranges
    const validRanges = highlightRanges
      .filter(r => r.start >= 0 && r.end > r.start && r.end <= content.length)
      .sort((a, b) => a.start - b.start);

    validRanges.forEach((range, i) => {
      // Text before
      if (range.start > lastEnd) {
        parts.push(<span key={`t-${i}`}>{content.substring(lastEnd, range.start)}</span>);
      }
      
      // Skip overlaps for simplicity in this version
      if (range.start < lastEnd) return;

      const isActive = activeCommentId === range.id;
      
      parts.push(
        <mark
          key={`h-${i}`}
          onClick={() => onCommentClick(range.id)}
          className="pointer-events-auto cursor-pointer rounded-sm transition-colors duration-200"
          style={{ 
            color: 'transparent',
            backgroundColor: isActive ? 'hsl(var(--highlight))' : 'hsla(45, 100%, 85%, 0.4)',
            borderBottom: isActive ? '2px solid black' : '1px solid transparent',
          }}
        >
          {content.substring(range.start, range.end)}
        </mark>
      );
      lastEnd = range.end;
    });

    if (lastEnd < content.length) {
      parts.push(<span key="end">{content.substring(lastEnd)}</span>);
    }

    return parts;
  };

  return (
    <div className="relative w-full text-lg leading-relaxed">
      {/* Highlight Layer */}
      <div
        className="absolute inset-0 whitespace-pre-wrap overflow-hidden pointer-events-none"
        style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          color: 'transparent',
          paddingBottom: '200px' // Match textarea buffer
        }}
        aria-hidden="true"
      >
        {renderHighlights()}
      </div>

      {/* Editing Layer */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        className="relative w-full bg-transparent resize-none outline-none border-none p-0 focus:ring-0 placeholder:text-[hsl(var(--text-tertiary))]"
        style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          minHeight: '600px',
          color: 'hsl(var(--text-primary))',
        }}
      />
    </div>
  );
};
