"use client";

import { useState, useRef, useEffect } from "react";

type Comment = {
  id: string;
  start_phrase: string;
  end_phrase: string;
  kind: "insert" | "rewrite" | "praise";
  category: "thesis" | "structure" | "clarity" | "logic" | "transitions" | "examples" | "tone" | "style" | "consistency" | "grammar";
  impact: "low" | "medium" | "high";
  feedback: string;
  suggested_edit: string | null;
  startIndex: number;
  endIndex: number;
  originalText?: string | null;
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

  // Simple text matching - find a phrase in the document
  const findPhrase = (phrase: string, doc: string): number => {
    if (!phrase || !doc) return -1;
    
    // Try exact match first
    const exactIndex = doc.indexOf(phrase);
    if (exactIndex !== -1) return exactIndex;
    
    // Try case-insensitive match
    const lowerDoc = doc.toLowerCase();
    const lowerPhrase = phrase.toLowerCase();
    const caseInsensitiveIndex = lowerDoc.indexOf(lowerPhrase);
    if (caseInsensitiveIndex !== -1) return caseInsensitiveIndex;
    
    // Try matching first few words (in case LLM truncated or modified)
    const words = phrase.split(/\s+/).slice(0, 5).join(' ');
    if (words.length > 10) {
      const wordsIndex = lowerDoc.indexOf(words.toLowerCase());
      if (wordsIndex !== -1) return wordsIndex;
    }
    
    return -1;
  };

  const processComments = (rawComments: any[]) => {
    console.log("[processComments] Received", rawComments?.length, "comments");
    console.log("[processComments] Content length:", content?.length);
    
    if (!rawComments || !content) {
      console.log("[processComments] No comments or no content");
      return;
    }
    
    const processed = rawComments.map((c, i) => {
      // Find start position
      const startIndex = findPhrase(c.start_phrase, content);
      
      // Calculate end based on the phrases
      let endIndex = -1;
      if (startIndex !== -1) {
        if (c.start_phrase === c.end_phrase) {
          // Same phrase - highlight just that phrase
          endIndex = startIndex + c.start_phrase.length;
        } else if (c.end_phrase) {
          // Different end phrase - find it after start
          const endPhraseStart = content.indexOf(c.end_phrase, startIndex);
          if (endPhraseStart !== -1) {
            endIndex = endPhraseStart + c.end_phrase.length;
          } else {
            // End phrase not found - use a reasonable chunk after start
            endIndex = Math.min(startIndex + c.start_phrase.length, content.length);
          }
        } else {
          endIndex = startIndex + c.start_phrase.length;
        }
      }
      
      console.log(`[processComments] Comment ${i}: "${c.start_phrase?.substring(0, 25)}..." → found at ${startIndex}-${endIndex}`);
      
      return {
        ...c,
        id: `comment-${Date.now()}-${i}`,
        startIndex,
        endIndex,
        originalText: startIndex >= 0 && endIndex > startIndex ? content.substring(startIndex, endIndex) : null,
      };
    });

    console.log("[processComments] Processed", processed.length, "comments,", processed.filter(c => c.startIndex >= 0).length, "with positions");
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
            pendingComments: comments.map((c) => c.feedback),
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
    if (!comment.suggested_edit) {
      console.log("[applyEdit] No suggested_edit for comment:", comment.id);
      return;
    }
    
    if (comment.startIndex < 0 || comment.endIndex <= comment.startIndex) {
      console.log("[applyEdit] Invalid position for comment:", comment.id, comment.startIndex, comment.endIndex);
      // If we have originalText stored, try to find and replace it
      if (comment.originalText) {
        const idx = content.indexOf(comment.originalText);
        if (idx !== -1) {
          const newContent = content.substring(0, idx) + comment.suggested_edit + content.substring(idx + comment.originalText.length);
          setContent(newContent);
          console.log("[applyEdit] Applied via originalText match");
        }
      }
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
      return;
    }
    
    // Apply the edit
    const before = content.substring(0, comment.startIndex);
    const after = content.substring(comment.endIndex);
    const newContent = before + comment.suggested_edit + after;
    
    console.log("[applyEdit] Replacing:", content.substring(comment.startIndex, comment.endIndex));
    console.log("[applyEdit] With:", comment.suggested_edit);
    
    setContent(newContent);
    
    // Track applied edit
    setAppliedEdits((prev) => [...prev, `Applied: "${comment.feedback}"`]);
    
    // Remove this comment and activate next
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    const remaining = comments.filter((c) => c.id !== comment.id);
    setActiveCommentId(remaining.length > 0 ? remaining[0].id : null);
  };

  const dismissComment = (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      setDismissedFeedback((prev) => [...prev, `Dismissed: "${comment.feedback}"`]);
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

  const lines = content.split('\n');

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
    <div className="min-h-screen bg-white">
      {/* Simple header */}
      <header className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center px-6 bg-white/80 backdrop-blur-sm">
        <h1 className="text-lg font-semibold text-stone-800">WriteGuide</h1>
        <div className="flex-1" />
        {wordCount > 0 && <span className="text-sm text-stone-400">{wordCount} words</span>}
      </header>

      {error && (
        <div className="fixed top-14 left-0 right-0 px-6 py-3 bg-red-50 text-red-600 text-sm z-30">
          {error}
        </div>
      )}

      <div className="flex pt-14">
        {/* Main editor */}
        <main className={`flex-1 transition-all ${hasAnalyzed ? 'mr-80' : ''}`}>
          <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Editor container - uses a backdrop for highlights */}
            <div className="relative">
              {/* Highlight backdrop - exactly matches textarea */}
              <div 
                className="absolute inset-0 whitespace-pre-wrap overflow-hidden pointer-events-none"
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '18px',
                  lineHeight: '1.75',
                  wordBreak: 'break-word',
                  padding: '0'
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
                    // Highlighted text (visible background, invisible text)
                    const isActive = activeCommentId === range.id;
                    parts.push(
                      <mark 
                        key={`h-${i}`} 
                        className={`${isActive ? "bg-amber-300" : "bg-amber-200"} rounded-sm`}
                        style={{ color: 'transparent' }}
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

              {/* Textarea - on top of highlights */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing or paste your text here..."
                className="relative w-full min-h-[60vh] bg-transparent text-stone-800 resize-none outline-none placeholder:text-stone-300 p-0"
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '18px',
                  lineHeight: '1.75',
                  wordBreak: 'break-word'
                }}
              />
            </div>

            {/* Analyze button */}
            {!hasAnalyzed && content.trim() && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {isLoading ? "Analyzing..." : "Get Feedback"}
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar */}
        {hasAnalyzed && (
          <aside className="fixed right-0 top-14 bottom-0 w-80 bg-white border-l border-stone-200 flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-stone-800">
                  {comments.length > 0 ? `${comments.length} Suggestions` : "Feedback"}
                </h2>
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  {isLoading ? "..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto">
              {comments.length > 0 ? (
                <div className="p-4 space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      onClick={() => handleCommentClick(comment)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        activeCommentId === comment.id
                          ? "bg-amber-50 ring-1 ring-amber-200"
                          : "bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      <p className="text-sm text-stone-700 leading-relaxed">{comment.feedback}</p>
                      
                      {comment.suggested_edit && (
                        <div className="mt-3 pt-3 border-t border-stone-200">
                          <p className="text-xs text-stone-400 mb-2">Suggested:</p>
                          <p className="text-sm text-stone-600 italic">{comment.suggested_edit}</p>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); applyEdit(comment); }}
                              className="px-3 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-full hover:bg-stone-800"
                            >
                              Apply
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); dismissComment(comment.id); }}
                              className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-stone-400 text-sm">
                  All done! 🎉
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="border-t border-stone-100 p-4">
              {messages.length > 0 && (
                <div className="mb-3 max-h-32 overflow-y-auto space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`text-sm ${msg.role === "user" ? "text-stone-600" : "text-stone-800"}`}>
                      {msg.role === "user" ? "You: " : ""}{msg.content}
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
                  className="w-full px-4 py-2.5 bg-stone-50 rounded-full text-sm outline-none placeholder:text-stone-400 focus:ring-1 focus:ring-stone-200"
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
