"use client";

import React from "react";
import { SuggestionCard, Comment } from "./SuggestionCard";
import { Send, RotateCcw } from "lucide-react";

interface FeedbackSidebarProps {
  comments: Comment[];
  activeCommentId: string | null;
  onCommentClick: (comment: Comment) => void;
  onApply: (comment: Comment) => void;
  onDismiss: (id: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  messages: any[];
  chatInput: string;
  setChatInput: (input: string) => void;
  onChatSubmit: (e: React.FormEvent) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

export const FeedbackSidebar: React.FC<FeedbackSidebarProps> = ({
  comments,
  activeCommentId,
  onCommentClick,
  onApply,
  onDismiss,
  onRefresh,
  isLoading,
  messages,
  chatInput,
  setChatInput,
  onChatSubmit,
  chatEndRef,
}) => {
  return (
    <aside className="h-full flex flex-col bg-white border-l border-stone-200">
      {/* Unified Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-stone-200 bg-white">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-900">
          Review & Discussion
        </h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`p-2 text-stone-400 hover:text-stone-900 transition-colors ${isLoading ? "animate-spin" : ""}`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Unified Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-none bg-white">
        {/* Suggestions Section */}
        {comments.length > 0 && (
          <div className="border-b border-stone-100">
            <div className="px-6 py-4 bg-stone-50/50">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                AI Suggestions ({comments.length})
              </span>
            </div>
            {comments.map((comment) => (
              <SuggestionCard
                key={comment.id}
                comment={comment}
                isActive={activeCommentId === comment.id}
                onClick={() => onCommentClick(comment)}
                onApply={onApply}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        )}

        {/* Chat/Discussion Section */}
        <div className="p-6 space-y-6">
          {messages.length > 0 ? (
            <div className="space-y-6">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-4">
                Conversation
              </span>
              {messages.map((msg, i) => (
                <div key={i} className="text-[14px] leading-relaxed group animate-in fade-in duration-500">
                  <span className="font-bold text-stone-900 uppercase tracking-widest text-[10px] block mb-1.5">
                    {msg.role === "user" ? "You" : "Assistant"}
                  </span>
                  <p className="text-stone-700 font-medium whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>
          ) : comments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-xs font-bold text-stone-300 uppercase tracking-[0.2em]">
                System Ready
              </p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Persistent Chat Input */}
      <div className="border-t border-stone-200 p-6 bg-white">
        <form onSubmit={onChatSubmit} className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Discuss changes or ask questions..."
            className="w-full pl-4 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900 transition-all shadow-sm"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !chatInput.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 disabled:opacity-30 transition-colors p-1.5"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
