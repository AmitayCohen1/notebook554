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
    
    // Sort raw comments by length (longest quotes first) to handle sub-matches better? 
    // Or just process sequentially.
    // We need to track used ranges to handle duplicates correctly.
    
    const usedIndices = new Set<number>();

    const processed = rawComments
      .map((c, i) => {
        // Find all occurrences of the quote
        const quote = c.quote;
        let searchIdx = 0;
        let foundIdx = -1;

        // Try to find an occurrence that hasn't been heavily overlapped yet
        // Simple heuristic: just find the first one that matches
        // Ideally we'd map them 1:1 if there are multiple same quotes
        
        // For v1: Find the first occurrence after the *previous* comment's position? 
        // No, comments come in arbitrary order.
        
        // Better: Find ALL occurrences, pick one that isn't taken.
        while (true) {
          const idx = content.indexOf(quote, searchIdx);
          if (idx === -1) break;
          
          // Check if this start index is already "claimed" by another exact same quote comment?
          // For now, let's just pick the first one. 
          // If we want to handle 2 comments on same line with same quote... complex.
          
          // Let's at least try to find *unique* positions for identical quotes if possible.
          const key = idx; 
          if (!usedIndices.has(key)) {
            foundIdx = idx;
            usedIndices.add(key);
            break;
          }
          searchIdx = idx + 1;
        }

        // Fallback: if all occurrences taken (or none found), pick the first one again or fail
        if (foundIdx === -1) {
           // Reset and just take the first one even if used
           foundIdx = content.indexOf(quote);
        }

        if (foundIdx === -1) {
          console.log(`[processComments] MISS - quote not found: "${quote.slice(0, 20)}..."`);
          return null;
        }

        return {
          id: `comment-${Date.now()}-${i}`,
          quote: c.quote,
          message: c.message,
          suggestion: c.suggestion ?? null,
          startIndex: foundIdx,
          endIndex: foundIdx + c.quote.length,
        };
      })
      .filter((c): c is Comment => c !== null)
      // Sort by start index so they flow naturally
      .sort((a, b) => a.startIndex - b.startIndex);

    console.log("[processComments] Processed comments:", processed.length);

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
          className="fixed bottom-10 right-10 z-50 flex items-center gap-3 px-6 py-4 bg-white text-black border border-stone-200 text-sm font-bold rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-105 hover:shadow-[0_8px_40px_rgba(0,0,0,0.16)] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Check my writing</span>
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
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-40">
                <p className="text-xl font-serif text-[hsl(var(--text-secondary))] italic">
                  Start writing...
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
