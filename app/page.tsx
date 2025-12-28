"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { Editor } from "./components/writing/Editor";
import { FeedbackSidebar } from "./components/feedback/FeedbackSidebar";
import { InlinePopup } from "./components/feedback/InlinePopup";
import { Comment } from "./components/feedback/SuggestionCard";
import { PanelRight, PanelRightClose } from "lucide-react";

type ConversationItem = 
  | { type: 'user'; id: string; content: string }
  | { type: 'assistant'; id: string; content: string }
  | { type: 'feedback'; id: string; text: string; comments: Comment[] };

export default function Home() {
  const [content, setContent] = useState("");
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"sidebar" | "inline">("inline");
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const allComments = conversation
    .filter((item): item is Extract<ConversationItem, { type: 'feedback' }> => item.type === 'feedback')
    .flatMap(item => item.comments);

  const activeComment = allComments.find(c => c.id === activeCommentId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Re-anchor comments when content changes
  useEffect(() => {
    if (allComments.length === 0) return;

    setConversation(prev => {
      const usedInThisPass = new Set<number>();
      return prev.map(item => {
        if (item.type !== 'feedback') return item;
        const updatedComments = item.comments.map((c) => {
          let foundIdx = -1;
          let searchIdx = 0;
          while (true) {
            const idx = content.indexOf(c.quote, searchIdx);
            if (idx === -1) break;
            if (!usedInThisPass.has(idx)) {
              foundIdx = idx;
              usedInThisPass.add(idx);
              break;
            }
            searchIdx = idx + 1;
          }
          if (foundIdx !== -1) {
            return { ...c, startIndex: foundIdx, endIndex: foundIdx + c.quote.length };
          }
          return { ...c, startIndex: -1, endIndex: -1 };
        });
        return { ...item, comments: updatedComments };
      });
    });
  }, [content]);

  const processComments = useCallback((rawComments: any[], assistantText: string) => {
    if (!rawComments || !content) return;
    const usedIndices = new Set<number>();
    const processed = rawComments
      .map((c, i) => {
        const quote = c.quote;
        let searchIdx = 0;
        let foundIdx = -1;
        while (true) {
          const idx = content.indexOf(quote, searchIdx);
          if (idx === -1) break;
          if (!usedIndices.has(idx)) {
            foundIdx = idx;
            usedIndices.add(idx);
            break;
          }
          searchIdx = idx + 1;
        }
        if (foundIdx === -1) foundIdx = content.indexOf(quote);
        if (foundIdx === -1) return null;
        return {
          id: `comment-${Date.now()}-${i}`,
          quote: c.quote,
          message: c.message,
          suggestion: c.suggestion ?? "",
          category: c.category || "style",
          startIndex: foundIdx,
          endIndex: foundIdx + c.quote.length,
        };
      })
      .filter((c): c is Comment => c !== null)
      .sort((a, b) => a.startIndex - b.startIndex);

    setConversation(prev => [...prev, {
      type: 'feedback',
      id: `feedback-${Date.now()}`,
      text: assistantText,
      comments: processed,
    }]);

    if (processed.length > 0) {
      setActiveCommentId(processed[0].id);
      if (viewMode === "inline") {
        // Don't auto-open popup, let user click
      }
    }
  }, [content, viewMode]);

  const sendMessage = async (messageContent: string, isAnalyze = false) => {
    if (!messageContent.trim()) return;
    setIsLoading(true);
    if (!isAnalyze) {
      setConversation(prev => [...prev, { type: 'user', id: `user-${Date.now()}`, content: messageContent }]);
    }

    try {
      const apiMessages = conversation
        .filter(item => item.type === 'user' || item.type === 'assistant')
        .map(item => ({ role: item.type as 'user' | 'assistant', content: (item as any).content }));
      
      if (!isAnalyze) apiMessages.push({ role: 'user', content: messageContent });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: isAnalyze ? "review" : "chat",
          messages: isAnalyze ? [{ role: "user", content: messageContent }] : apiMessages,
          document: content,
          context: { pendingComments: allComments.map((c) => c.message) },
        }),
      });

      if (!response.ok) throw new Error("API failed");
      const data = await response.json();

      if (data.comments && data.comments.length > 0) {
        processComments(data.comments, data.text);
      } else if (data.text) {
        setConversation(prev => [...prev, { type: 'assistant', id: `assistant-${Date.now()}`, content: data.text }]);
      }
    } catch (err) {
      console.error(err);
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
    setActiveCommentId(null);
    setPopupPosition(null);
  };

  const dismissComment = (commentId: string) => {
    setConversation(prev => prev.map(item => {
      if (item.type !== 'feedback') return item;
      return { ...item, comments: item.comments.filter(c => c.id !== commentId) };
    }));
    setActiveCommentId(null);
    setPopupPosition(null);
  };

  const handleCommentClick = (id: string, position: { x: number; y: number }) => {
    setActiveCommentId(id);
    if (viewMode === "inline") {
      setPopupPosition(position);
    }
  };

  const highlightRanges = allComments
    .filter(c => c.startIndex !== -1)
    .map(c => ({ start: c.startIndex, end: c.endIndex, id: c.id, category: c.category }));

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F5F5F5]">
      <Header 
        wordCount={content.trim() ? content.trim().split(/\s+/).length : 0} 
        suggestionsCount={allComments.length} 
        hasAnalyzed={conversation.length > 0}
        onAnalyze={() => sendMessage("Review my text.", true)}
        isAnalyzing={isLoading}
      />

      <div className="flex-1 flex pt-14 overflow-hidden">
        {/* Editor Container */}
        <main className={`h-full overflow-y-auto scrollbar-none flex flex-col items-center pt-16 pb-[50vh] transition-all duration-500 ${viewMode === "sidebar" ? "w-3/5" : "w-full"}`}>
          {/* Paper Sheet */}
          <div className="w-full max-w-3xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-stone-200 px-16 py-24 relative">
            <Editor
              content={content}
              setContent={setContent}
              highlightRanges={highlightRanges}
              activeCommentId={activeCommentId}
              onCommentClick={handleCommentClick}
            />
            
            {!content.trim() && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none text-center">
                <p className="text-4xl font-serif italic">Type something.</p>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar Panel (only in sidebar mode) */}
        {viewMode === "sidebar" && (
          <aside className="w-2/5 h-full bg-white border-l border-stone-200">
            <FeedbackSidebar
              conversation={conversation}
              activeCommentId={activeCommentId}
              onCommentClick={(id) => handleCommentClick(id, { x: 0, y: 0 })}
              onApply={applyEdit}
              onDismiss={dismissComment}
              onRefresh={() => sendMessage("Review my text.", true)}
              isLoading={isLoading}
              chatInput={chatInput}
              setChatInput={setChatInput}
              onChatSubmit={(e) => { e.preventDefault(); sendMessage(chatInput); setChatInput(""); }}
              chatEndRef={chatEndRef}
            />
          </aside>
        )}
      </div>

      {/* Inline Popup (only in inline mode) */}
      {viewMode === "inline" && activeComment && popupPosition && (
        <InlinePopup
          comment={activeComment}
          position={popupPosition}
          onApply={applyEdit}
          onDismiss={dismissComment}
          onClose={() => { setActiveCommentId(null); setPopupPosition(null); }}
        />
      )}

      {/* View Mode Toggle */}
      <button
        onClick={() => setViewMode(viewMode === "sidebar" ? "inline" : "sidebar")}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-full shadow-lg text-sm font-medium text-stone-600 hover:bg-stone-50 transition-all"
      >
        {viewMode === "sidebar" ? (
          <>
            <PanelRightClose className="w-4 h-4" />
            Focus Mode
          </>
        ) : (
          <>
            <PanelRight className="w-4 h-4" />
            Sidebar
          </>
        )}
      </button>
    </div>
  );
}
