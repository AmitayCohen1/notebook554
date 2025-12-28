"use client";

import React, { useRef, useEffect } from "react";
import { Sparkle } from "lucide-react";

interface Range {
  start: number;
  end: number;
  id: string;
  category?: string;
}

interface EditorProps {
  content: string;
  setContent: (content: string) => void;
  highlightRanges: Range[];
  activeCommentId: string | null;
  onCommentClick: (id: string, position: { x: number; y: number }) => void;
  onActiveMarkPositionChange?: (position: { x: number; y: number }) => void;
  isAnalyzing?: boolean;
}

const CategoryIcon = ({ isActive }: { isActive: boolean }) => {
  return <Sparkle className={`w-3 h-3 ${isActive ? "text-black" : "text-indigo-400"}`} />;
};

export const Editor: React.FC<EditorProps> = ({
  content,
  setContent,
  highlightRanges,
  activeCommentId,
  onCommentClick,
  onActiveMarkPositionChange,
  isAnalyzing = false,
}) => {
  const activeMarkRef = useRef<HTMLElement | null>(null);
  const [selection, setSelection] = React.useState<{ start: number; end: number } | null>(null);

  // Monitor text selection
  React.useEffect(() => {
    const handleSelection = () => {
      const activeEl = document.activeElement;
      if (activeEl instanceof HTMLTextAreaElement) {
        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        if (start !== end) {
          setSelection({ start, end });
        } else {
          setSelection(null);
        }
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  // Auto-scroll AND update position for the popup
  useEffect(() => {
    if (activeCommentId && activeMarkRef.current) {
      // 1. Scroll into view
      activeMarkRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // 2. Wait for scroll/layout, then report position
      const timer = setTimeout(() => {
        if (!activeMarkRef.current) return;
        
        const rect = activeMarkRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          onActiveMarkPositionChange?.({ 
            x: rect.left + rect.width / 2, // Center of mark
            y: rect.bottom 
          });
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [activeCommentId, onActiveMarkPositionChange]);

  const handleIconClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    onCommentClick(id, { x: rect.left, y: rect.bottom });
  };

  const renderHighlights = () => {
    let textToRender = content || " ";
    if (content.endsWith("\n")) textToRender = content + " ";

    if (highlightRanges.length === 0) {
      return <>{textToRender}</>;
    }

    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    const sortedRanges = [...highlightRanges]
      .filter((r) => r.start >= 0 && r.end > r.start && r.end <= content.length)
      .sort((a, b) => a.start - b.start);

    sortedRanges.forEach((range, i) => {
      if (range.start > lastEnd) {
        parts.push(
          <span key={`t-${i}`}>{content.substring(lastEnd, range.start)}</span>
        );
      }

      if (range.start < lastEnd) return;

      const isActive = activeCommentId === range.id;

      parts.push(
        <span key={`h-${range.id}`} className="relative inline">
          {/* Floating Icon */}
          <span
            onClick={(e) => handleIconClick(e, range.id)}
            className={`
              absolute -top-8 left-0 z-20 flex items-center justify-center w-6 h-6 rounded-full cursor-pointer transition-all
              ${isActive 
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110" 
                : "bg-stone-800 text-indigo-400 border border-white/10 shadow-sm hover:bg-stone-700 hover:scale-105"
              }
            `}
            style={{ pointerEvents: "auto" }}
          >
            <CategoryIcon isActive={isActive} />
          </span>
          
          {/* Highlighted Text */}
          <mark
            ref={isActive ? activeMarkRef : null}
            className={`rounded-sm transition-colors duration-200 cursor-pointer ${
              isActive 
                ? "bg-indigo-500/30 ring-1 ring-indigo-500/50" 
                : "bg-white/10 hover:bg-white/20"
            }`}
            onClick={(e) => handleIconClick(e, range.id)}
            style={{ pointerEvents: "auto", color: "inherit" }}
          >
            {content.substring(range.start, range.end)}
          </mark>
        </span>
      );
      lastEnd = range.end;
    });

    if (lastEnd < textToRender.length) {
      parts.push(<span key="end">{textToRender.substring(lastEnd)}</span>);
    }

    return <>{parts}</>;
  };

  const sharedStyles: React.CSSProperties = {
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    padding: 0,
    margin: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    paddingTop: "0px",
  };

  return (
    <div
      className="relative w-full h-full min-h-[800px]"
    >
      {/* Scanning Overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-30 overflow-hidden pointer-events-none rounded-2xl">
          <div className="scanning-overlay" />
          <div className="scanning-beam" />
        </div>
      )}

      {/* Layer 1: Visible Text + Highlights + Icons (RELATIVE - drives height) */}
      <div
        className="relative select-none"
        style={{
          ...sharedStyles,
          color: "#e5e5e5", // Soft white
          paddingTop: "24px",
          pointerEvents: "none",
        }}
      >
        {renderHighlights()}
        
        {/* Selection Metadata (Cinematic side-info) */}
        {selection && (
          <div className="absolute top-0 -right-32 flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-500">
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest opacity-40">Section</div>
            <div className="text-xs font-medium text-white/20 uppercase tracking-tighter">
              {selection.end - selection.start} chars selected
            </div>
          </div>
        )}
      </div>

      {/* Layer 2: Invisible Textarea (ABSOLUTE - fills height) */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        spellCheck={false}
        className="absolute inset-0 w-full h-full bg-transparent resize-none outline-none border-none p-0 focus:ring-0 overflow-hidden"
        style={{
          ...sharedStyles,
          color: "transparent", // Invisible text
          caretColor: "#ffffff", // Bright white cursor
          paddingTop: "24px",
        }}
      />
    </div>
  );
};
