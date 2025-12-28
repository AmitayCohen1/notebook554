"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { Editor } from "./components/writing/Editor";
import { FeedbackSidebar } from "./components/feedback/FeedbackSidebar";
import { Comment } from "./components/feedback/SuggestionCard";
import { Sparkles, Loader2 } from "lucide-react";

type ConversationItem = 
  | { type: 'user'; id: string; content: string }
  | { type: 'assistant'; id: string; content: string }
  | { type: 'feedback'; id: string; text: string; comments: Comment[] };

export default function Home() {
  const [content, setContent] = useState("");
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const allComments = conversation
    .filter((item): item is Extract<ConversationItem, { type: 'feedback' }> => item.type === 'feedback')
    .flatMap(item => item.comments);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Re-anchor comments when content changes (find quote again)
  useEffect(() => {
    if (allComments.length === 0) return;

    setConversation(prev => prev.map(item => {
      if (item.type !== 'feedback') return item;
      
      const updatedComments = item.comments
        .map((c) => {
          const idx = content.indexOf(c.quote);
          if (idx === -1) return null; // Quote no longer exists
          return { ...c, startIndex: idx, endIndex: idx + c.quote.length };
        })
        .filter((c): c is Comment => c !== null);
      
      return { ...item, comments: updatedComments };
    }));
  }, [content]);

  const processComments = useCallback((rawComments: any[], assistantText: string) => {
    if (!rawComments || !content) return;
    
    console.log("[processComments] Raw comments:", rawComments.length);
    
    const processed = rawComments
      .map((c, i) => {
        const idx = content.indexOf(c.quote);
        console.log(`[processComments] Quote "${c.quote.slice(0, 30)}..." -> idx: ${idx}`);
        if (idx === -1) {
          console.log(`[processComments] MISS - quote not found in content`);
          return null;
        }
        return {
          id: `comment-${Date.now()}-${i}`,
          quote: c.quote,
          message: c.message,
          suggestion: c.suggestion ?? null,
          startIndex: idx,
          endIndex: idx + c.quote.length,
        };
      })
      .filter((c): c is Comment => c !== null);

    console.log("[processComments] Processed comments:", processed.length);
    console.log("[processComments] Indices:", processed.map(c => `${c.startIndex}-${c.endIndex}`));

    setConversation(prev => [...prev, {
      type: 'feedback',
      id: `feedback-${Date.now()}`,
      text: assistantText || "Here's my feedback.",
      comments: processed,
    }]);

    if (processed.length > 0) setActiveCommentId(processed[0].id);
  }, [content]);

  const sendMessage = async (messageContent: string, isAnalyze = false) => {
    if (!messageContent.trim()) return;
    setIsLoading(true);
    setError(null);

    if (!isAnalyze) {
      setConversation(prev => [...prev, { type: 'user', id: `user-${Date.now()}`, content: messageContent }]);
    }

    try {
      const apiMessages = conversation
        .filter(item => item.type === 'user' || item.type === 'assistant')
        .map(item => ({ role: item.type as 'user' | 'assistant', content: (item as any).content }));
      
      if (!isAnalyze) {
        apiMessages.push({ role: 'user', content: messageContent });
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: isAnalyze ? "review" : "chat",
          messages: isAnalyze ? [{ role: "user", content: messageContent }] : apiMessages,
          document: content,
          context: { 
            pendingComments: allComments.map((c) => c.message)
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();

      if (data.comments && data.comments.length > 0) {
        processComments(data.comments, data.text);
      } else if (data.text) {
        setConversation(prev => [...prev, { type: 'assistant', id: `assistant-${Date.now()}`, content: data.text }]);
      }
    } catch (err) {
      setError("Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyEdit = (comment: Comment) => {
    if (!comment.suggestion) return;
    const newContent = content.substring(0, comment.startIndex) + comment.suggestion + content.substring(comment.endIndex);
    setContent(newContent);
    
    setConversation(prev => prev.map(item => {
      if (item.type !== 'feedback') return item;
      return { ...item, comments: item.comments.filter(c => c.id !== comment.id) };
    }));
  };

  const dismissComment = (commentId: string) => {
    setConversation(prev => prev.map(item => {
      if (item.type !== 'feedback') return item;
      return { ...item, comments: item.comments.filter(c => c.id !== commentId) };
    }));
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const highlightRanges = allComments.map(c => ({ 
    start: c.startIndex, 
    end: c.endIndex, 
    id: c.id,
  }));

  // Debug: log highlight ranges when they change
  useEffect(() => {
    if (highlightRanges.length > 0) {
      console.log("[highlightRanges]", highlightRanges);
      console.log("[content length]", content.length);
    }
  }, [highlightRanges, content.length]);

  const showSidebar = conversation.length > 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-deep))]">
      <Header 
        wordCount={wordCount} 
        suggestionsCount={allComments.length} 
        hasAnalyzed={showSidebar} 
      />

      {/* Floating "Get feedback" button */}
      {!showSidebar && content.trim() && (
        <button
          onClick={() => sendMessage("Please review my document.", true)}
          disabled={isLoading}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2.5 px-5 py-3 bg-[hsl(var(--accent))] text-[hsl(var(--bg-deep))] text-sm font-semibold rounded-full hover:scale-105 transition-smooth active:scale-95 disabled:opacity-60 shadow-lg animate-fade-up"
          style={{ boxShadow: '0 4px 24px hsl(var(--accent) / 0.4)' }}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Get feedback</span>
        </button>
      )}

      <div className="pt-12 h-screen flex">
        <main className="flex-1 overflow-y-auto scrollbar-minimal writing-zone">
          <div className="max-w-3xl mx-auto px-8 py-16">
            <div className="animate-fade-up">
              <Editor
                content={content}
                setContent={setContent}
                highlightRanges={highlightRanges}
                activeCommentId={activeCommentId}
                onCommentClick={setActiveCommentId}
              />
            </div>

{!content.trim() && (
              <div className="mt-32 text-center animate-fade-up">
                <p className="text-sm text-[hsl(var(--text-muted))]">
                  Start writing to get feedback
                </p>
              </div>
            )}
          </div>
        </main>

        <div 
          className={`transition-all duration-300 ease-out
            ${showSidebar ? 'w-[380px] opacity-100' : 'w-0 overflow-hidden opacity-0'}
          `}
        >
          <FeedbackSidebar
            conversation={conversation}
            activeCommentId={activeCommentId}
            onCommentClick={setActiveCommentId}
            onApply={applyEdit}
            onDismiss={dismissComment}
            onRefresh={() => sendMessage("Please review my document again.", true)}
            isLoading={isLoading}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onChatSubmit={(e) => { e.preventDefault(); sendMessage(chatInput); setChatInput(""); }}
            chatEndRef={chatEndRef}
          />
        </div>
      </div>
    </div>
  );
}
