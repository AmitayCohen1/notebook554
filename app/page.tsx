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
    
    const usedIndices = new Set<number>();

    const processed = rawComments
      .map((c, i) => {
        const quote = c.quote;
        let searchIdx = 0;
        let foundIdx = -1;

        while (true) {
          const idx = content.indexOf(quote, searchIdx);
          if (idx === -1) break;
          
          const key = idx; 
          if (!usedIndices.has(key)) {
            foundIdx = idx;
            usedIndices.add(key);
            break;
          }
          searchIdx = idx + 1;
        }

        if (foundIdx === -1) {
           foundIdx = content.indexOf(quote);
        }

        if (foundIdx === -1) {
          return null;
        }

        return {
          id: `comment-${Date.now()}-${i}`,
          quote: c.quote,
          message: c.message,
          suggestion: c.suggestion ?? null,
          category: c.category || "style",
          startIndex: foundIdx,
          endIndex: foundIdx + c.quote.length,
        };
      })
      .filter((c): c is Comment => c !== null)
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

  const showSidebar = conversation.length > 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-deep))]">
      <Header 
        wordCount={wordCount} 
        suggestionsCount={allComments.length} 
        hasAnalyzed={showSidebar}
        onAnalyze={() => sendMessage("Please review my document.", true)}
        isAnalyzing={isLoading}
      />

      <div className="pt-16 h-screen flex">
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
          className={`transition-all duration-500 ease-out border-l border-stone-200 bg-[#FDFDFD] shadow-2xl
            ${showSidebar ? 'w-[600px] translate-x-0' : 'w-0 translate-x-full overflow-hidden opacity-0'}
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
