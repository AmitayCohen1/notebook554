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
    <aside className="h-full flex flex-col bg-[hsl(var(--bg-surface))] border-l border-[hsl(var(--border))]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-12 border-b border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[hsl(var(--accent))]" />
          <span className="text-sm font-medium text-[hsl(var(--text-primary))]">
            Feedback
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`p-2 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] rounded-lg hover:bg-[hsl(var(--bg-hover))] transition-smooth ${isLoading ? "animate-spin" : ""}`}
          title="Re-analyze"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto scrollbar-minimal">
        <div className="py-4 space-y-4">
          {conversation.map((item, index) => {
            if (item.type === 'user') {
              return (
                <div key={item.id} className="px-4 animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[hsl(var(--bg-hover))] text-[hsl(var(--text-secondary))] flex items-center justify-center text-xs font-medium shrink-0">
                      Y
                    </div>
                    <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed pt-1">
                      {item.content}
                    </p>
                  </div>
                </div>
              );
            }

            if (item.type === 'assistant') {
              return (
                <div key={item.id} className="px-4 animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed pt-1">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-[hsl(var(--text-primary))]">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          code: ({ children }) => <code className="text-xs bg-[hsl(var(--bg-hover))] px-1.5 py-0.5 rounded font-mono text-[hsl(var(--accent))]">{children}</code>,
                        }}
                      >
                        {item.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            }

            if (item.type === 'feedback') {
              return (
                <div key={item.id} className="space-y-3 animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Intro */}
                  <div className="px-4">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="pt-1">
                        <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                          {item.text}
                        </p>
                        {item.comments.length > 0 && (
                          <p className="text-xs text-[hsl(var(--text-muted))] mt-1">
                            {item.comments.length} suggestion{item.comments.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Cards */}
                  {item.comments.length > 0 && (
                    <div className="space-y-2 px-3">
                      {item.comments.map((comment, i) => (
                        <div key={comment.id} className="animate-fade-up" style={{ animationDelay: `${(index * 50) + (i * 75)}ms` }}>
                          <SuggestionCard
                            comment={comment}
                            isActive={activeCommentId === comment.id}
                            onClick={() => onCommentClick(comment.id)}
                            onApply={onApply}
                            onDismiss={onDismiss}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
          
          {/* Loading */}
          {isLoading && (
            <div className="px-4 animate-fade-up">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[hsl(var(--accent-soft))] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--accent))] animate-pulse" />
                </div>
                <div className="flex gap-1 pt-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--text-muted))] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--text-muted))] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--text-muted))] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[hsl(var(--border-subtle))]">
        <form onSubmit={onChatSubmit} className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask anything..."
            className="w-full pl-4 pr-11 py-2.5 bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--text-primary))] outline-none placeholder:text-[hsl(var(--text-muted))] focus:border-[hsl(var(--accent)/0.5)] focus:ring-1 focus:ring-[hsl(var(--accent)/0.2)] transition-smooth"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !chatInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--accent))] disabled:opacity-30 transition-smooth rounded-lg hover:bg-[hsl(var(--accent-soft))]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
