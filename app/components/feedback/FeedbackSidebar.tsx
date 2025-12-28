"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { SuggestionCard, Comment } from "./SuggestionCard";
import { Send, RotateCcw, Sparkles, User, Bot } from "lucide-react";

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
    <aside className="h-full flex flex-col bg-[hsl(var(--surface-1))]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-0))]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-linear-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-primary-hover))] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-[hsl(var(--warm-800))]">
            Feedback
          </h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`p-2 text-[hsl(var(--warm-400))] hover:text-[hsl(var(--warm-700))] rounded-lg hover:bg-[hsl(var(--warm-100))] transition-smooth ${isLoading ? "animate-spin" : ""}`}
          title="Re-analyze document"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Conversation Stream */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="py-5 space-y-5">
          {conversation.map((item, index) => {
            if (item.type === 'user') {
              return (
                <div 
                  key={item.id} 
                  className="px-5 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--warm-800))] text-white flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p className="text-[13px] text-[hsl(var(--warm-700))] leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            if (item.type === 'assistant') {
              return (
                <div 
                  key={item.id} 
                  className="px-5 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[hsl(var(--accent-tertiary))] to-[hsl(var(--accent-secondary))] text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="text-[13px] text-[hsl(var(--warm-700))] leading-relaxed mb-2.5 last:mb-0">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-[hsl(var(--warm-800))]">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => <em className="italic">{children}</em>,
                            ul: ({ children }) => (
                              <ul className="text-[13px] text-[hsl(var(--warm-700))] list-disc pl-4 mb-2.5 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="text-[13px] text-[hsl(var(--warm-700))] list-decimal pl-4 mb-2.5 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            code: ({ children }) => (
                              <code className="text-[12px] bg-[hsl(var(--warm-100))] px-1.5 py-0.5 rounded font-mono text-[hsl(var(--accent-primary))]">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {item.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (item.type === 'feedback') {
              return (
                <div 
                  key={item.id} 
                  className="space-y-4 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Feedback intro message */}
                  <div className="px-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] text-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="text-[13px] text-[hsl(var(--warm-700))] leading-relaxed">
                          {item.text}
                        </p>
                        {item.comments.length > 0 && (
                          <p className="text-[11px] text-[hsl(var(--warm-400))] mt-1.5 font-medium">
                            {item.comments.length} suggestion{item.comments.length !== 1 ? 's' : ''} found
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Suggestion cards */}
                  {item.comments.length > 0 && (
                    <div className="space-y-2.5 px-4">
                      {item.comments.map((comment, commentIndex) => (
                        <div
                          key={comment.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${(index * 50) + (commentIndex * 75)}ms` }}
                        >
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
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="px-5 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--warm-200))] text-[hsl(var(--warm-400))] flex items-center justify-center shrink-0 animate-pulse-subtle">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 pt-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--warm-300))] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--warm-300))] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--warm-300))] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-0))]">
        <form onSubmit={onChatSubmit} className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about your writing..."
            className="w-full pl-4 pr-12 py-3 bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--warm-800))] outline-none placeholder:text-[hsl(var(--warm-400))] focus:border-[hsl(var(--accent-primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--accent-primary)/0.1)] transition-smooth"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !chatInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[hsl(var(--warm-400))] hover:text-[hsl(var(--accent-primary))] disabled:opacity-30 disabled:hover:text-[hsl(var(--warm-400))] transition-smooth rounded-lg hover:bg-[hsl(var(--accent-soft))]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
