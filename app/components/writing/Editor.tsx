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

  // Build highlighted content
  const renderHighlightedContent = () => {
    if (highlightRanges.length === 0) {
      return content;
    }

    const parts: React.ReactNode[] = [];
    let lastEnd = 0;
    
    // Sort ranges and filter out invalid ones
    const validRanges = highlightRanges
      .filter(r => r.start >= 0 && r.end > r.start && r.end <= content.length)
      .sort((a, b) => a.start - b.start);
    
    console.log("[Editor] validRanges:", validRanges.length, "of", highlightRanges.length);
    console.log("[Editor] content.length:", content.length);

    validRanges.forEach((range, i) => {
      // Add text before this range
      if (range.start > lastEnd) {
        parts.push(
          <span key={`t-${i}`}>{content.substring(lastEnd, range.start)}</span>
        );
      }
      
      // Skip if this range overlaps with previous
      if (range.start < lastEnd) {
        return;
      }

      const isActive = activeCommentId === range.id;
      
      const highlightedText = content.substring(range.start, range.end);
      console.log(`[Editor] Rendering mark ${i}: "${highlightedText.slice(0, 20)}..." (${range.start}-${range.end})`);
      
      parts.push(
        <mark
          key={`h-${i}`}
          onClick={() => onCommentClick(range.id)}
          className="pointer-events-auto cursor-pointer rounded-sm transition-all"
          style={{ 
            color: 'transparent',
            backgroundColor: isActive 
              ? 'hsla(35, 100%, 55%, 0.35)' 
              : 'hsla(35, 100%, 55%, 0.2)',
            borderBottom: isActive 
              ? '3px solid hsl(35, 100%, 55%)' 
              : '2px solid hsla(35, 100%, 55%, 0.7)',
            boxShadow: isActive 
              ? '0 2px 12px hsla(35, 100%, 55%, 0.4)' 
              : 'none',
            padding: '0 1px',
            margin: '0 -1px',
          }}
        >
          {highlightedText}
        </mark>
      );
      lastEnd = range.end;
    });

    // Add remaining text
    if (lastEnd < content.length) {
      parts.push(
        <span key="t-end">{content.substring(lastEnd)}</span>
      );
    }

    return parts;
  };

  return (
    <div className="relative w-full" style={{ minHeight: '500px' }}>
      {/* Highlight layer - mirrors the textarea exactly */}
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
        {renderHighlightedContent()}
      </div>

      {/* Textarea */}
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
          caretColor: 'hsl(35, 100%, 55%)',
        }}
      />
    </div>
  );
};
