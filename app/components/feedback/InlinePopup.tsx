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
  return (
    <>
      {/* Cinematic Spotlight Backdrop - Blurs everything except active area */}
      <div 
        className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20 animate-in fade-in duration-500" 
        style={{
          maskImage: `radial-gradient(circle 250px at ${position.x}px ${position.y - 100}px, transparent 0%, black 100%)`,
          WebkitMaskImage: `radial-gradient(circle 250px at ${position.x}px ${position.y - 100}px, transparent 0%, black 100%)`,
        }}
        onClick={onClose} 
      />

      {/* Popup - Wider & Under the text */}
      <div
        className="fixed z-50 w-[420px] bg-[#0a0a0a] text-white rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden transition-all"
        style={{
          left: Math.min(Math.max(position.x - 210, 20), window.innerWidth - 440),
          top: position.y + 12,
        }}
      >
        {/* Progress line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${(currentIndex / totalCount) * 100}%` }} 
          />
        </div>

        <div className="p-5 space-y-4 text-center">
          {/* Header area - Category & Progress */}
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.15em] text-white/20">
            <div className="flex items-center gap-1.5">
              <Sparkle className="w-2.5 h-2.5 text-indigo-400/80" />
              <span>{comment.category} • {currentIndex}/{totalCount}</span>
            </div>
            <button onClick={onClose} className="hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* The Reason - Small text on top */}
          <p className="text-[13px] font-medium text-white/50 leading-snug">
            {comment.message}
          </p>

          {/* The Suggestion - Large and clear at the core */}
          <div className="text-lg font-bold text-white leading-tight tracking-tight px-2">
            {comment.suggestion}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onApply(comment)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-black text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5" />
              Apply
            </button>
            <button
              onClick={() => onDismiss(comment.id)}
              className="px-5 py-2.5 bg-white/5 text-white/40 text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
