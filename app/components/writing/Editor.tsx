"use client";

import React, { useRef, useEffect } from "react";
import { Zap, Wind, Feather } from "lucide-react";

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
  onCommentClick: (id: string) => void;
  isAnalyzing?: boolean;
}

const CategoryIcon = ({ category, isActive }: { category?: string; isActive: boolean }) => {
  const iconClass = `w-3 h-3 ${isActive ? "text-black" : "text-indigo-400"}`;
  switch (category) {
    case "grammar": return <Zap className={iconClass} />;
    case "clarity": return <Wind className={iconClass} />;
    case "style": return <Feather className={iconClass} />;
    default: return <Feather className={iconClass} />;
  }
};

export const Editor: React.FC<EditorProps> = ({
  content,
  setContent,
  highlightRanges,
  activeCommentId,
  onCommentClick,
  isAnalyzing = false,
}) => {
  const activeMarkRef = useRef<HTMLElement | null>(null);

  // Auto-scroll to active mark
  useEffect(() => {
    if (activeCommentId && activeMarkRef.current) {
      activeMarkRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeCommentId]);

  const handleIconClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onCommentClick(id);
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
            <CategoryIcon category={range.category} isActive={isActive} />
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
    paddingTop: "24px",
  };

  return (
    <div
      className="grid w-full h-full min-h-[800px] relative"
      style={{ gridTemplateColumns: "1fr", gridTemplateRows: "1fr" }}
    >
      {/* Scanning Overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-30 overflow-hidden pointer-events-none rounded-2xl">
          <div className="scanning-overlay" />
          <div className="scanning-beam" />
        </div>
      )}

      {/* Layer 1: Visible Text + Highlights + Icons */}
      <div
        className="select-none h-full"
        style={{
          ...sharedStyles,
          gridArea: "1 / 1 / 2 / 2",
          color: "#e5e5e5", // Soft white
          pointerEvents: "none",
        }}
      >
        {renderHighlights()}
      </div>

      {/* Layer 2: Invisible Textarea (for editing) */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        spellCheck={false}
        className="resize-none h-full w-full"
        style={{
          ...sharedStyles,
          gridArea: "1 / 1 / 2 / 2",
          color: "transparent",
          caretColor: "#ffffff", // Bright white cursor
        }}
      />
    </div>
  );
};
