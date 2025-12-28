"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { SuggestionCard, Comment } from "./SuggestionCard";
import { Send, RotateCcw, Sparkles, MessageSquare, ArrowRight } from "lucide-react";

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
    <aside className="h-full flex flex-col bg-[#FDFDFD] border-l border-stone-200 shadow-xl shadow-stone-200/50">
      {/* Header - Stylish & Big */}
      <div className="flex items-center justify-between px-8 h-20 border-b border-stone-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-stone-900" />
            Review
          </h2>
          <span className="text-xs font-medium text-stone-400 mt-0.5">
            AI Writing Assistant
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`p-2.5 text-stone-400 hover:text-stone-900 rounded-xl hover:bg-stone-50 transition-all border border-transparent hover:border-stone-200 ${isLoading ? "animate-spin" : ""}`}
          title="Re-analyze document"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Content Stream */}
      <div className="flex-1 overflow-y-auto scrollbar-clean px-8 py-8 bg-[#FDFDFD]">
        <div className="space-y-10">
          {conversation.map((item) => {
            if (item.type === 'user') {
              return (
                <div key={item.id} className="flex justify-end animate-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-stone-900 text-white px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-sm max-w-[85%]">
                    {item.content}
                  </div>
                </div>
              );
            }

            if (item.type === 'assistant') {
              return (
                <div key={item.id} className="flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Sparkles className="w-5 h-5 text-stone-900" />
                  </div>
                  <div className="prose prose-stone max-w-none bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                </div>
              );
            }

            if (item.type === 'feedback') {
              return (
                <div key={item.id} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Intro Message */}
                  {item.text && (
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm">
                        <MessageSquare className="w-5 h-5 text-stone-700" />
                      </div>
                      <div className="bg-white p-5 rounded-2xl rounded-tl-sm border border-stone-100 shadow-sm flex-1">
                        <p className="text-stone-700 text-[15px] leading-relaxed font-medium">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Suggestion Cards Stack */}
                  {item.comments.length > 0 && (
                    <div className="space-y-5 pl-4 border-l-2 border-stone-100 ml-5">
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
            <div className="flex gap-4 animate-pulse px-2">
              <div className="w-10 h-10 rounded-full bg-stone-200 shrink-0" />
              <div className="space-y-3 flex-1 pt-2">
                <div className="h-3 bg-stone-200 rounded-full w-2/3" />
                <div className="h-3 bg-stone-200 rounded-full w-1/2" />
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-stone-100 bg-white sticky bottom-0 z-10">
        <form onSubmit={onChatSubmit} className="relative group">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask a question about your writing..."
            className="w-full pl-5 pr-14 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-[15px] text-stone-900 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400 shadow-sm group-hover:shadow-md"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !chatInput.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 text-white bg-stone-900 rounded-xl hover:bg-black disabled:opacity-30 disabled:bg-stone-400 transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
