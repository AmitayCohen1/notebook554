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

  // Sync heights
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  const renderHighlights = () => {
    // Add a trailing space to ensure the highlighter div has the same layout as textarea
    const textToRender = content + (content.endsWith('\n') ? ' ' : '');
    
    if (highlightRanges.length === 0) return <span>{textToRender}</span>;

    const parts: React.ReactNode[] = [];
    let lastEnd = 0;
    
    const sortedRanges = [...highlightRanges]
      .filter(r => r.start >= 0 && r.end > r.start && r.end <= content.length)
      .sort((a, b) => a.start - b.start);

    sortedRanges.forEach((range, i) => {
      if (range.start > lastEnd) {
        parts.push(<span key={`t-${i}`}>{content.substring(lastEnd, range.start)}</span>);
      }
      
      if (range.start < lastEnd) return;

      const isActive = activeCommentId === range.id;
      
      parts.push(
        <mark
          key={`h-${range.id}`}
          onClick={() => onCommentClick(range.id)}
          className={`
            relative cursor-pointer transition-all duration-200 rounded-sm
            ${isActive 
              ? "bg-indigo-600/20 border-b-2 border-indigo-600" 
              : "bg-indigo-100/50 border-b border-indigo-200 hover:bg-indigo-100"
            }
          `}
          style={{ color: 'transparent' }}
        >
          {content.substring(range.start, range.end)}
        </mark>
      );
      lastEnd = range.end;
    });

    if (lastEnd < textToRender.length) {
      parts.push(<span key="end">{textToRender.substring(lastEnd)}</span>);
    }

    return parts;
  };

  return (
    <div className="grid w-full relative">
      {/* 
        This "ghost" div and the textarea occupy the exact same grid cell.
        The ghost div sets the height of the container.
      */}
      <div
        className="col-start-1 row-start-1 whitespace-pre-wrap break-words pointer-events-none"
        style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontSize: '20px',
          lineHeight: '1.8',
          color: 'transparent',
          padding: '0',
          margin: '0',
          minHeight: '800px',
        }}
        aria-hidden="true"
      >
        {renderHighlights()}
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        className="col-start-1 row-start-1 w-full bg-transparent resize-none outline-none border-none p-0 focus:ring-0 overflow-hidden"
        style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontSize: '20px',
          lineHeight: '1.8',
          color: '#1a1a1a',
          padding: '0',
          margin: '0',
          minHeight: '800px',
        }}
      />
    </div>
  );
};
