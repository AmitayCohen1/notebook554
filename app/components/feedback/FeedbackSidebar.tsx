"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { SuggestionCard, Comment } from "./SuggestionCard";
import { Send, RotateCcw, MessageSquare } from "lucide-react";

type ConversationItem = 
  | { type: 'user'; id: string; content: string }
  | { type: 'assistant'; id: string; content: string }
  | { type: 'feedback'; id: string; text: string; comments: Comment[] };

interface FeedbackSidebarProps {
  conversation: ConversationItem[];
  activeCommentId: string | null;
  onCommentClick: (id: string) => void;
  onApply: (comment: Comment) => void;
  onDismiss: (id: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  chatInput: string;
  setChatInput: (input: string) => void;
  onChatSubmit: (e: React.FormEvent) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

export const FeedbackSidebar: React.FC<FeedbackSidebarProps> = ({
  conversation,
  activeCommentId,
  onCommentClick,
  onApply,
  onDismiss,
  onRefresh,
  isLoading,
  chatInput,
  setChatInput,
  onChatSubmit,
  chatEndRef,
}) => {
  return (
    <aside className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-6 h-14 border-b border-stone-100">
        <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Review</span>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`p-2 text-stone-400 hover:text-black transition-colors ${isLoading ? "animate-spin" : ""}`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-6">
        <div className="py-6 space-y-2">
          {conversation.map((item) => {
            if (item.type === 'user') {
              return (
                <div key={item.id} className="text-sm text-stone-400 italic mb-4">
                  “{item.content}”
                </div>
              );
            }

            if (item.type === 'assistant') {
              return (
                <div key={item.id} className="prose prose-sm prose-stone max-w-none bg-stone-50 p-4 rounded-xl mb-6">
                  <ReactMarkdown>{item.content}</ReactMarkdown>
                </div>
              );
            }

            if (item.type === 'feedback') {
              return (
                <div key={item.id}>
                  {item.comments.map((comment) => (
                    <SuggestionCard
                      key={comment.id}
                      comment={comment}
                      isActive={activeCommentId === comment.id}
                      onClick={() => onCommentClick(comment.id)}
                      onApply={onApply}
                      onDismiss={onDismiss}
                    />
                  ))}
                </div>
              );
            }

            return null;
          })}
          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <form onSubmit={onChatSubmit} className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-black transition-all"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !chatInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-black disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
