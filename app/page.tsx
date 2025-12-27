"use client";

import { useState, useRef, useEffect } from "react";

type Comment = {
  id: string;
  original_text: string;
  comment: string;
  suggestion: string | null;
  kind: "insert" | "rewrite" | "praise";
  category: "thesis" | "structure" | "clarity" | "logic" | "transitions" | "examples" | "tone" | "style" | "consistency" | "grammar";
  impact: "low" | "medium" | "high";
  startIndex: number;
  endIndex: number;
};

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
  
  // Track history for context
  const [appliedEdits, setAppliedEdits] = useState<string[]>([]);
  const [dismissedFeedback, setDismissedFeedback] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastContentRef = useRef<string>("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // Debug: log when comments change
  useEffect(() => {
    console.log("[UI] Comments updated:", comments.length, "comments");
    comments.forEach((c, i) => {
      console.log(`[UI] Comment ${i}: startIndex=${c.startIndex}, endIndex=${c.endIndex}`);
    });
  }, [comments]);

  // Re-calculate comment positions when content changes
  useEffect(() => {
    if (comments.length === 0 || content === lastContentRef.current) return;

    console.log("[ContentChange] Content changed, re-calculating", comments.length, "comment positions");
    lastContentRef.current = content;

    const updatedComments = comments
      .map((c) => {
        const startIndex = content.indexOf(c.original_text);
        if (startIndex === -1) {
          console.warn("[ContentChange] ⚠️ Could not find text:", c.original_text.substring(0, 50));
          return null; // Comment text no longer exists in document
        }
        const endIndex = startIndex + c.original_text.length;

        // Only return updated if position changed
        if (c.startIndex === startIndex && c.endIndex === endIndex) {
          return c; // No change
        }

        return { ...c, startIndex, endIndex };
      })
      .filter((c): c is Comment => c !== null);

    setComments(updatedComments);
  }, [content, comments]); // Need both dependencies

  const processComments = (rawComments: any[]) => {
    console.log("[processComments] ====== PROCESSING COMMENTS ======");
    console.log("[processComments] Received", rawComments?.length, "comments");
    console.log("[processComments] Content length:", content?.length);

    if (!rawComments || !content) {
      console.log("[processComments] No comments or no content");
      return;
    }

    const processed = rawComments
      .map((c, i) => {
        console.log(`[processComments] ===== Comment ${i} =====`);
        console.log(`[processComments] Raw from LLM:`, c);
        console.log(`[processComments] Looking for text: "${c.original_text}"`);

        // Find exact match
        const startIndex = content.indexOf(c.original_text);

        if (startIndex === -1) {
          console.warn(`[processComments] ⚠️ Could not find exact match for: "${c.original_text}"`);
          // TODO: Add fuzzy matching fallback
          return null;
        }

        const endIndex = startIndex + c.original_text.length;

        console.log(`[processComments] ✓ Found at indices: ${startIndex}-${endIndex}`);
        console.log(`[processComments] Matched text: "${content.substring(startIndex, endIndex)}"`);
        console.log(`[processComments] ========================`);

        return {
          ...c,
          id: `comment-${Date.now()}-${i}`,
          startIndex,
          endIndex,
        };
      })
      .filter((c): c is Comment => c !== null);

    console.log("[processComments] Successfully processed", processed.length, "comments");
    setComments(processed);
    if (processed.length > 0) setActiveCommentId(processed[0].id);
  };

  const sendMessage = async (messageContent: string, isAnalyze = false) => {
    if (!messageContent.trim()) return;
    setIsLoading(true);
    setError(null);

    if (!isAnalyze) {
      const userMessage: Message = { id: `msg-${Date.now()}`, role: "user", content: messageContent };
      setMessages((prev) => [...prev, userMessage]);
    }

    try {
      const validMessages = messages.filter((m) => m.content.trim());
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: isAnalyze 
            ? [{ role: "user", content: messageContent }] 
            : [...validMessages, { role: "user", content: messageContent }],
          document: content,
          context: {
            pendingComments: comments.map((c) => c.comment),
            appliedEdits,
            dismissedFeedback,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

        const data = await response.json();
      console.log("[sendMessage] Response:", data);

      // Add assistant message if there's text and not analyzing
      if (!isAnalyze && data.text) {
        setMessages((prev) => [...prev, { 
          id: `msg-${Date.now() + 1}`, 
          role: "assistant", 
          content: data.text 
        }]);
      }

      // Process comments if any - do this BEFORE setting hasAnalyzed
      if (data.comments && data.comments.length > 0) {
        console.log("[sendMessage] Processing", data.comments.length, "comments");
        console.log("[sendMessage] First comment:", JSON.stringify(data.comments[0], null, 2));
        processComments(data.comments);
      } else {
        console.log("[sendMessage] No comments in response. data.comments:", data.comments);
      }
      
      // Always mark as analyzed after an analyze request
      if (isAnalyze) {
        console.log("[sendMessage] Setting hasAnalyzed=true, comments count:", data.comments?.length || 0);
        setHasAnalyzed(true);
      }
    } catch (err) {
      console.error("[sendMessage] Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (!content.trim()) return;
    sendMessage("Please review my document and provide feedback.", true);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    sendMessage(chatInput);
    setChatInput("");
  };

  const applyEdit = (comment: Comment) => {
    // Validate we have a suggested edit and valid positions
    if (!comment.suggestion) {
      console.log("[applyEdit] No suggestion for comment:", comment.id);
      return;
    }

    // Apply the edit
    const before = content.substring(0, comment.startIndex);
    const after = content.substring(comment.endIndex);
    const newContent = before + comment.suggestion + after;

    console.log("[applyEdit] Replacing:", content.substring(comment.startIndex, comment.endIndex));
    console.log("[applyEdit] With:", comment.suggestion);

    setContent(newContent);

    // Track applied edit
    setAppliedEdits((prev) => [...prev, `Applied: "${comment.comment}"`]);

    // Remove this comment
    const remainingComments = comments.filter((c) => c.id !== comment.id);

    // Re-calculate positions for remaining comments based on new content
    console.log("[applyEdit] Re-calculating positions for", remainingComments.length, "remaining comments");
    const updatedComments = remainingComments
      .map((c) => {
        const startIndex = newContent.indexOf(c.original_text);
        if (startIndex === -1) {
          console.warn("[applyEdit] ⚠️ Could not find text after edit:", c.original_text);
          return null;
        }
        const endIndex = startIndex + c.original_text.length;
        console.log(`[applyEdit] Updated comment "${c.comment}" → indices ${startIndex}-${endIndex}`);
        return { ...c, startIndex, endIndex };
      })
      .filter((c): c is Comment => c !== null);

    setComments(updatedComments);
    setActiveCommentId(updatedComments.length > 0 ? updatedComments[0].id : null);
  };

  const dismissComment = (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      setDismissedFeedback((prev) => [...prev, `Dismissed: "${comment.comment}"`]);
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    const remaining = comments.filter((c) => c.id !== commentId);
    setActiveCommentId(remaining.length > 0 ? remaining[0].id : null);
  };

  const handleCommentClick = (comment: Comment) => {
    setActiveCommentId(comment.id);
    if (textareaRef.current && comment.startIndex !== undefined) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(comment.startIndex, comment.endIndex || comment.startIndex);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Build highlight ranges
  const highlightRanges = comments
    .filter(c => c.startIndex >= 0 && c.endIndex > c.startIndex)
    .map(c => ({ start: c.startIndex, end: c.endIndex, id: c.id }))
    .sort((a, b) => a.start - b.start);
  
  // Debug: log highlight info
  if (comments.length > 0) {
    console.log("[Render] Comments:", comments.length, "Highlights:", highlightRanges.length);
    console.log("[Render] Highlight ranges:", highlightRanges);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Modern header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-8 bg-white/90 backdrop-blur-xl border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">W</span>
          </div>
          <h1 className="text-xl font-bold text-stone-900">WriteGuide</h1>
        </div>
        <div className="flex items-center gap-6">
          {wordCount > 0 && (
            <span className="text-sm text-stone-500 font-medium">{wordCount} words</span>
          )}
          {comments.length > 0 && (
            <span className="text-sm text-indigo-600 font-medium">{comments.length} suggestions</span>
          )}
        </div>
      </header>

      {error && (
        <div className="fixed top-16 left-0 right-0 px-8 py-4 bg-red-50 text-red-700 border-b border-red-200 text-sm z-30">
          {error}
        </div>
      )}

      <div className="pt-16">
        {/* Main editor - centered, shifts when sidebar opens */}
        <main className={`max-w-4xl mx-auto px-8 py-12 transition-all duration-300 ${hasAnalyzed ? 'mr-96' : ''}`}>
          {/* Writing surface */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-12 min-h-[70vh]">
            <div className="relative">
              {/* Underline layer for highlights */}
              <div
                className="absolute inset-0 whitespace-pre-wrap overflow-hidden"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '19px',
                  lineHeight: '1.8',
                  wordBreak: 'break-word',
                  padding: '0',
                  pointerEvents: 'none'
                }}
                aria-hidden="true"
              >
                {(() => {
                  if (highlightRanges.length === 0) {
                    return <span className="invisible">{content || ' '}</span>;
                  }

                  const parts: React.ReactNode[] = [];
                  let lastEnd = 0;

                  highlightRanges.forEach((range, i) => {
                    // Text before highlight (invisible)
                    if (range.start > lastEnd) {
                      parts.push(
                        <span key={`t-${i}`} className="invisible">
                          {content.substring(lastEnd, range.start)}
                        </span>
                      );
                    }
                    // Underlined text
                    const isActive = activeCommentId === range.id;
                    parts.push(
                      <mark
                        key={`h-${i}`}
                        onClick={() => {
                          const comment = comments.find(c => c.id === range.id);
                          if (comment) handleCommentClick(comment);
                        }}
                        className={`
                          ${isActive ? "bg-amber-100 decoration-amber-500" : "bg-transparent decoration-indigo-400"}
                          underline decoration-wavy decoration-2 underline-offset-4
                          cursor-pointer transition-all duration-200
                          hover:bg-indigo-50
                        `}
                        style={{ color: 'transparent', pointerEvents: 'auto' }}
                      >
                        {content.substring(range.start, range.end)}
                      </mark>
                    );
                    lastEnd = range.end;
                  });

                  // Remaining text (invisible)
                  if (lastEnd < content.length) {
                    parts.push(
                      <span key="end" className="invisible">
                        {content.substring(lastEnd)}
                      </span>
                    );
                  }
                  return parts;
                })()}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing or paste your text here..."
                className="relative w-full min-h-[60vh] bg-transparent text-stone-900 resize-none outline-none placeholder:text-stone-400 p-0"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '19px',
                  lineHeight: '1.8',
                  wordBreak: 'break-word'
                }}
              />
            </div>
          </div>

          {/* Analyze button */}
          {!hasAnalyzed && content.trim() && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-base font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  "✨ Get Feedback"
                )}
              </button>
            </div>
          )}
        </main>

        {/* Right sidebar - comments */}
        {hasAnalyzed && (
          <aside className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-stone-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-stone-900 text-lg">
                    Suggestions
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {comments.length} {comments.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="p-2 text-stone-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Refresh"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto">
              {comments.length > 0 ? (
                <div className="p-6 space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      onClick={() => handleCommentClick(comment)}
                      className={`group rounded-xl border-2 transition-all cursor-pointer ${
                        activeCommentId === comment.id
                          ? "border-indigo-400 bg-indigo-50/50 shadow-md"
                          : "border-stone-200 bg-white hover:border-indigo-200 hover:shadow-sm"
                      }`}
                    >
                      <div className="p-5">
                        {/* Category badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            comment.impact === 'high' ? 'bg-red-100 text-red-700' :
                            comment.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-stone-100 text-stone-600'
                          }`}>
                            {comment.category}
                          </span>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs text-stone-500 capitalize">{comment.kind}</span>
                        </div>

                        {/* Original text quote */}
                        <div className="mb-3 pl-3 border-l-3 border-stone-300">
                          <p className="text-xs text-stone-600 italic line-clamp-2">
                            "{comment.original_text}"
                          </p>
                        </div>

                        {/* Comment */}
                        <p className="text-sm text-stone-700 leading-relaxed font-medium mb-3">
                          {comment.comment}
                        </p>

                        {/* Suggestion */}
                        {comment.suggestion && (
                          <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
                            <p className="text-xs text-stone-500 font-medium mb-2">Suggested revision:</p>
                            <p className="text-sm text-stone-800 leading-relaxed">
                              {comment.suggestion}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex gap-2">
                          {comment.suggestion && (
                            <button
                              onClick={(e) => { e.stopPropagation(); applyEdit(comment); }}
                              className="flex-1 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              Apply
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); dismissComment(comment.id); }}
                            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🎉</span>
                  </div>
                  <p className="text-stone-900 font-semibold mb-1">All done!</p>
                  <p className="text-stone-500 text-sm">No suggestions remaining</p>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="border-t border-stone-200 p-5 bg-white">
              {messages.length > 0 && (
                <div className="mb-4 max-h-32 overflow-y-auto space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`text-sm ${msg.role === "user" ? "text-stone-600" : "text-stone-800"}`}>
                      <span className="font-semibold mr-2 text-xs uppercase text-stone-400">
                        {msg.role === "user" ? "You" : "AI"}
                      </span>
                      {msg.content}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}
              <form onSubmit={handleChatSubmit}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  disabled={isLoading}
                />
              </form>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
