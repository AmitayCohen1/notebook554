"use client";

import React from "react";
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
}

const CategoryIcon = ({ category, isActive }: { category?: string; isActive: boolean }) => {
  const iconClass = `w-3 h-3 ${isActive ? "text-white" : "text-indigo-600"}`;
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
}) => {
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
            onClick={(e) => {
              e.stopPropagation();
              onCommentClick(range.id);
            }}
            className={`
              absolute -top-5 left-0 z-20 flex items-center justify-center w-5 h-5 rounded-full cursor-pointer transition-all
              ${isActive 
                ? "bg-indigo-600 text-white shadow-lg" 
                : "bg-white text-indigo-600 border border-indigo-200 shadow-sm hover:bg-indigo-50"
              }
            `}
            style={{ pointerEvents: "auto" }}
          >
            <CategoryIcon category={range.category} isActive={isActive} />
          </span>
          
          {/* Highlighted Text - TEXT IS VISIBLE HERE */}
          <mark
            className={`rounded-sm transition-colors duration-200 ${
              isActive ? "bg-indigo-200" : "bg-indigo-100"
            }`}
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
    fontSize: "20px",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    padding: 0,
    margin: 0,
    border: "none",
    outline: "none",
    background: "transparent",
  };

  return (
    <div
      className="grid min-h-[800px]"
      style={{ gridTemplateColumns: "1fr", gridTemplateRows: "1fr" }}
    >
      {/* Layer 1: Visible Text + Highlights + Icons */}
      <div
        className="pointer-events-none select-none"
        style={{
          ...sharedStyles,
          gridArea: "1 / 1 / 2 / 2",
          color: "#1a1a1a", // TEXT IS VISIBLE
          paddingTop: "24px",
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
        className="resize-none"
        style={{
          ...sharedStyles,
          gridArea: "1 / 1 / 2 / 2",
          color: "transparent", // TEXT IS INVISIBLE - user types into this
          caretColor: "#1a1a1a", // But cursor is visible
          paddingTop: "24px",
        }}
      />
    </div>
  );
};
