"use client";

import React from "react";
import { SuggestionCard, Comment } from "./SuggestionCard";
import { Send, RotateCcw, MessageCircle, Sparkles } from "lucide-react";

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
      <div className="flex items-center justify-between px-5 h-14 border-b border-stone-100 bg-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-stone-400" />
          <h2 className="text-xs font-bold text-stone-700">
            Conversation
          </h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-50 transition-colors ${isLoading ? "animate-spin" : ""}`}
          title="Re-analyze document"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Unified Conversation Stream */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="py-4 space-y-4">
          {conversation.map((item) => {
            if (item.type === 'user') {
              return (
                <div key={item.id} className="px-5">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      Y
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-[13px] text-stone-700 leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (item.type === 'assistant') {
              return (
                <div key={item.id} className="px-5">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      AI
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-[13px] text-stone-700 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (item.type === 'feedback') {
              return (
                <div key={item.id} className="space-y-3">
                  {/* Feedback intro message */}
                  <div className="px-5">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-[13px] text-stone-700 leading-relaxed">{item.text}</p>
                        {item.comments.length > 0 && (
                          <p className="text-[11px] text-stone-400 mt-1">
                            {item.comments.length} suggestion{item.comments.length !== 1 ? 's' : ''} added
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Comments as cards */}
                  {item.comments.length > 0 && (
                    <div className="space-y-2 px-3">
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
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="px-5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <form onSubmit={onChatSubmit} className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about your writing..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-stone-200 rounded-2xl text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all shadow-sm"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !chatInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-900 disabled:opacity-30 transition-colors rounded-xl hover:bg-stone-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
