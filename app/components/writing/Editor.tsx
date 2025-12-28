"use client";

import React from "react";

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
  const renderHighlights = () => {
    // Must match textarea content exactly, including trailing newline behavior
    let textToRender = content || " "; // Ensure there's always at least a space
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
        <mark
          key={`h-${range.id}`}
          className={`rounded-sm ${
            isActive ? "bg-indigo-200" : "bg-indigo-50"
          }`}
          style={{ color: "transparent" }}
        >
          {content.substring(range.start, range.end)}
        </mark>
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
      {/* Layer 1: Highlights (in flow, sets height) */}
      <div
        className="pointer-events-none select-none"
        style={{
          ...sharedStyles,
          gridArea: "1 / 1 / 2 / 2",
          color: "transparent",
        }}
        aria-hidden="true"
      >
        {renderHighlights()}
      </div>

      {/* Layer 2: Textarea (in same grid cell, overlays Layer 1) */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        spellCheck={false}
        className="resize-none"
        style={{
          ...sharedStyles,
          gridArea: "1 / 1 / 2 / 2",
          color: "#1a1a1a",
          caretColor: "#1a1a1a",
        }}
      />
    </div>
  );
};
