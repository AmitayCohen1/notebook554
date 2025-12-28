"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { Editor } from "./components/writing/Editor";
import { FeedbackSidebar } from "./components/feedback/FeedbackSidebar";
import { Comment } from "./components/feedback/SuggestionCard";
import { Sparkles, Loader2 } from "lucide-react";

// Unified conversation item - can be a message or a feedback batch
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
  const lastContentRef = useRef<string>("");

  // Derive all active comments from the conversation
  const allComments = conversation
    .filter((item): item is Extract<ConversationItem, { type: 'feedback' }> => item.type === 'feedback')
    .flatMap(item => item.comments);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Re-calculate comment positions when document content changes
  useEffect(() => {
    if (allComments.length === 0 || content === lastContentRef.current) return;
    lastContentRef.current = content;

    // Update positions of all comments in feedback items
    setConversation(prev => prev.map(item => {
      if (item.type !== 'feedback') return item;
      
      const updatedComments = item.comments
        .map((c) => {
          const startIndex = content.indexOf(c.original_text);
          if (startIndex === -1) return null;
          const endIndex = startIndex + c.original_text.length;
          if (c.startIndex === startIndex && c.endIndex === endIndex) return c;
          return { ...c, startIndex, endIndex };
        })
        .filter((c): c is Comment => c !== null);
      
      return { ...item, comments: updatedComments };
    }));
  }, [content, allComments.length]);

  const processComments = useCallback((rawComments: any[], assistantText: string) => {
    if (!rawComments || !content) return;
    
    const processed = rawComments
      .map((c, i) => {
        const startIndex = content.indexOf(c.original_text);
        if (startIndex === -1) return null;
        const endIndex = startIndex + c.original_text.length;
        return {
          ...c,
          id: `comment-${Date.now()}-${i}`,
          startIndex,
          endIndex,
        };
      })
      .filter((c): c is Comment => c !== null);

    // Add as a feedback conversation item
    setConversation(prev => [...prev, {
      type: 'feedback',
      id: `feedback-${Date.now()}`,
      text: assistantText || "I've reviewed your document.",
      comments: processed,
    }]);

    if (processed.length > 0) setActiveCommentId(processed[0].id);
  }, [content]);

  const sendMessage = async (messageContent: string, isAnalyze = false) => {
    if (!messageContent.trim()) return;
    setIsLoading(true);
    setError(null);

    // Add user message to conversation (unless it's the initial analyze)
    if (!isAnalyze) {
      setConversation(prev => [...prev, { type: 'user', id: `user-${Date.now()}`, content: messageContent }]);
    }

    try {
      // Build messages array for the API from conversation
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
          messages: isAnalyze ? [{ role: "user", content: messageContent }] : apiMessages,
          document: content,
          context: { 
            pendingComments: allComments.map((c) => c.comment)
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();

      // If we got comments, add as feedback item
      if (data.comments && data.comments.length > 0) {
        processComments(data.comments, data.text);
      } else if (data.text) {
        // Text-only response
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
    
    // Remove comment from the feedback item it belongs to
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
    category: c.category
  }));

  const showSidebar = conversation.length > 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header 
        wordCount={wordCount} 
        suggestionsCount={allComments.length} 
        hasAnalyzed={showSidebar} 
      />

      <div className="pt-14 h-screen flex">
        {/* Main editor area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Paper container */}
            <div 
              className="w-full bg-[hsl(var(--surface-0))] paper-shadow rounded-lg animate-fade-in"
              style={{ minHeight: 'calc(100vh - 160px)' }}
            >
              <div className="px-12 py-16 sm:px-16 sm:py-20">
                <Editor
                  content={content}
                  setContent={setContent}
                  highlightRanges={highlightRanges}
                  activeCommentId={activeCommentId}
                  onCommentClick={setActiveCommentId}
                />
              </div>
            </div>

            {/* Analyze button */}
            {!showSidebar && content.trim() && (
              <div className="py-10 flex justify-center animate-fade-in stagger-2">
                <button
                  onClick={() => sendMessage("Please review my document and provide feedback.", true)}
                  disabled={isLoading}
                  className="group flex items-center gap-3 px-7 py-3.5 bg-linear-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-primary-hover))] text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-smooth active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  )}
                  <span>Analyze my writing</span>
                </button>
              </div>
            )}

            {/* Empty state */}
            {!content.trim() && (
              <div className="py-16 text-center animate-fade-in stagger-3">
                <p className="text-sm text-[hsl(var(--warm-400))]">
                  Start writing above, then click analyze to get feedback
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <div 
          className={`transition-all duration-300 ease-out border-l border-[hsl(var(--border-subtle))]
            ${showSidebar ? 'w-[400px] opacity-100' : 'w-0 overflow-hidden opacity-0'}
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
