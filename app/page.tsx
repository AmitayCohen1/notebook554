"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { Editor } from "./components/writing/Editor";
import { FeedbackSidebar } from "./components/feedback/FeedbackSidebar";
import { Comment } from "./components/feedback/SuggestionCard";
import { Search, Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  
  const [appliedEdits, setAppliedEdits] = useState<string[]>([]);
  const [dismissedFeedback, setDismissedFeedback] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef<string>("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (comments.length === 0 || content === lastContentRef.current) return;
    lastContentRef.current = content;

    const updatedComments = comments
      .map((c) => {
        const startIndex = content.indexOf(c.original_text);
        if (startIndex === -1) return null;
        const endIndex = startIndex + c.original_text.length;
        if (c.startIndex === startIndex && c.endIndex === endIndex) return c;
        return { ...c, startIndex, endIndex };
      })
      .filter((c): c is Comment => c !== null);

    setComments(updatedComments);
  }, [content, comments]);

  const processComments = useCallback((rawComments: any[]) => {
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

    setComments(processed);
    if (processed.length > 0) setActiveCommentId(processed[0].id);
  }, [content]);

  const sendMessage = async (messageContent: string, isAnalyze = false) => {
    if (!messageContent.trim()) return;
    setIsLoading(true);
    setError(null);

    if (!isAnalyze) {
      setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, role: "user", content: messageContent }]);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: isAnalyze ? [{ role: "user", content: messageContent }] : [...messages, { role: "user", content: messageContent }],
          document: content,
          context: { pendingComments: comments.map((c) => c.comment), appliedEdits, dismissedFeedback },
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();

      if (!isAnalyze && data.text) {
        setMessages((prev) => [...prev, { id: `msg-${Date.now() + 1}`, role: "assistant", content: data.text }]);
      }
      if (data.comments) processComments(data.comments);
      if (isAnalyze) setHasAnalyzed(true);
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
    setComments(prev => prev.filter(c => c.id !== comment.id));
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const highlightRanges = comments.map(c => ({ 
    start: c.startIndex, 
    end: c.endIndex, 
    id: c.id,
    category: c.category
  }));

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-stone-200">
      <Header 
        wordCount={wordCount} 
        suggestionsCount={comments.length} 
        hasAnalyzed={hasAnalyzed} 
      />

      <div className="pt-14 h-screen flex">
        <main className="flex-1 overflow-y-auto bg-stone-50/30">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <Editor
              content={content}
              setContent={setContent}
              highlightRanges={highlightRanges}
              activeCommentId={activeCommentId}
              onCommentClick={setActiveCommentId}
            />

            {!hasAnalyzed && content.trim() && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => sendMessage("Analyze document", true)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-widest rounded shadow-sm hover:bg-stone-800 transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Run analysis
                </button>
              </div>
            )}
          </div>
        </main>

        <div className={`transition-all duration-300 ease-in-out border-l border-stone-200
          ${hasAnalyzed ? 'w-[400px]' : 'w-0 overflow-hidden opacity-0'}
        `}>
          <FeedbackSidebar
            comments={comments}
            activeCommentId={activeCommentId}
            onCommentClick={(c) => setActiveCommentId(c.id)}
            onApply={applyEdit}
            onDismiss={(id) => setComments(prev => prev.filter(c => c.id !== id))}
            onRefresh={() => sendMessage("Analyze document", true)}
            isLoading={isLoading}
            messages={messages}
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
