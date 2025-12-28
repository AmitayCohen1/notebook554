"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { SuggestionCard, Comment } from "./SuggestionCard";
import { Send, RotateCcw, Sparkles } from "lucide-react";

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
    <aside className="h-full flex flex-col bg-white border-l border-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-stone-100">
        <h2 className="text-lg font-bold text-stone-900 tracking-tight">
          Review
        </h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors ${isLoading ? "animate-spin" : ""}`}
          title="Re-analyze document"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-clean px-6 py-6">
        <div className="space-y-8">
          {conversation.map((item) => {
            if (item.type === 'user') {
              return (
                <div key={item.id} className="flex justify-end">
                  <div className="bg-stone-100 text-stone-800 px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[85%]">
                    {item.content}
                  </div>
                </div>
              );
            }

            if (item.type === 'assistant') {
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="prose prose-sm prose-stone max-w-none">
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                </div>
              );
            }

            if (item.type === 'feedback') {
              return (
                <div key={item.id} className="space-y-6">
                  {/* Intro */}
                  {item.text && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0 mt-1">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <p className="text-stone-600 leading-relaxed pt-1">
                        {item.text}
                      </p>
                    </div>
                  )}
                  
                  {/* Cards */}
                  {item.comments.length > 0 && (
                    <div className="space-y-4 pl-11">
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
                  )}
                </div>
              );
            }

            return null;
          })}
          
          {isLoading && (
            <div className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0" />
              <div className="space-y-2 flex-1 pt-2">
                <div className="h-2 bg-stone-200 rounded w-3/4" />
                <div className="h-2 bg-stone-200 rounded w-1/2" />
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-stone-100">
        <form onSubmit={onChatSubmit} className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full pl-4 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all placeholder:text-stone-400"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !chatInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-900 disabled:opacity-30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
