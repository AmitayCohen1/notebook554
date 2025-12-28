"use client";

import React from "react";
import { Check, X, Sparkle } from "lucide-react";
import { Comment } from "./SuggestionCard";

interface InlinePopupProps {
  comment: Comment;
  currentIndex: number;
  totalCount: number;
  onApply: (comment: Comment) => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export const InlinePopup: React.FC<InlinePopupProps> = ({
  comment,
  currentIndex,
  totalCount,
  onApply,
  onDismiss,
  onClose,
  position,
}) => {
  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onApply(comment);
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        onDismiss(comment.id);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [comment, onApply, onDismiss, onClose]);

  return (
    <>
      {/* Cinematic Spotlight Backdrop - Much larger area of clear visibility */}
      <div 
        className="fixed inset-0 z-40 backdrop-blur-md bg-black/40 animate-in fade-in duration-500" 
        style={{
          maskImage: `radial-gradient(circle 800px at ${position.x}px ${position.y - 100}px, transparent 0%, black 100%)`,
          WebkitMaskImage: `radial-gradient(circle 800px at ${position.x}px ${position.y - 100}px, transparent 0%, black 100%)`,
        }}
        onClick={onClose} 
      />

      {/* Popup - Wider & Surgical */}
      <div
        className="fixed z-50 w-[600px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] text-white rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.9)] border border-white/10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden transition-all"
      >
        {/* Progress line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${(currentIndex / totalCount) * 100}%` }} 
          />
        </div>

        <div className="p-8 space-y-6 text-left">
          {/* Header area - Category & Progress */}
          <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
            <div className="flex items-center gap-2">
              <Sparkle className="w-3 h-3 text-indigo-400/80" />
              <span>{comment.category} • {currentIndex}/{totalCount}</span>
            </div>
            <button onClick={onClose} className="hover:text-white transition-colors p-1 -mr-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* The Reason - Light & Simple */}
            <p className="text-sm font-medium text-white/60 leading-relaxed max-w-xl">
              {comment.message}
            </p>

            {/* The Suggestion - Clear and un-bolded */}
            <div className="text-xl font-medium text-white leading-relaxed tracking-tight">
              {comment.suggestion}
            </div>
          </div>

          {/* Action Row - Simple buttons with keyboard hints */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onApply(comment)}
              className="group flex-1 flex items-center justify-between px-8 py-4 bg-white text-black text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Apply Fix
              </div>
              <span className="text-[9px] opacity-30 group-hover:opacity-100 font-mono border border-black/10 px-1 rounded">ENTER</span>
            </button>
            <button
              onClick={() => onDismiss(comment.id)}
              className="group flex items-center justify-between px-8 py-4 bg-white/5 text-white/50 text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              Skip
              <span className="text-[9px] opacity-20 group-hover:opacity-100 font-mono border border-white/10 px-1 rounded ml-4">S</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
