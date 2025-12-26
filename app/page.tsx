"use client";

import { useState, useRef, useEffect } from "react";
import ShinyText from "./components/ShinyText";
import { Typewriter } from "./components/Typewriter";

type OverallAssessment = {
  summary: string;
};

type Comment = {
  id: string;
  start_phrase: string;
  end_phrase: string;
  kind: "rewrite" | "insert" | "delete" | "clarify" | "question" | "praise";
  category: "thesis" | "structure" | "clarity" | "logic" | "transitions" | "examples" | "tone" | "style";
  impact: "low" | "medium" | "high";
  feedback: string;
  suggested_edit: string | null;
  // Computed fields for rendering
  startIndex?: number;
  endIndex?: number;
  quoted_text?: string;
};

export default function Home() {
  const [document, setDocument] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [overallAssessment, setOverallAssessment] = useState<OverallAssessment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interaction State
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [filterImpact, setFilterImpact] = useState<"all" | "high" | "medium" | "low">("all");

  // History state
  const [past, setPast] = useState<{ document: string; comments: Comment[] }[]>([]);
  const [future, setFuture] = useState<{ document: string; comments: Comment[] }[]>([]);
  const historyTimeoutRef = useRef<NodeJS.Timeout>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commentsListRef = useRef<HTMLDivElement>(null);

  // Filtered comments logic
  const filteredComments = comments.filter((c) => {
    if (filterImpact !== "all" && c.impact !== filterImpact) return false;
    return true;
  });

  // Sort comments by position
  const sortedComments = [...filteredComments].sort((a, b) => 
    (a.startIndex || 0) - (b.startIndex || 0)
  );

  // Undo/Redo Logic
  const saveToHistory = (doc: string, comms: Comment[]) => {
    setPast((prev) => {
      const newPast = [...prev, { document: doc, comments: comms }];
      if (newPast.length > 50) return newPast.slice(newPast.length - 50);
      return newPast;
    });
    setFuture([]);
  };

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setFuture((prev) => [{ document, comments }, ...prev]);
    setPast(past.slice(0, past.length - 1));
    setDocument(previous.document);
    setComments(previous.comments);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setPast((prev) => [...prev, { document, comments }]);
    setFuture(future.slice(1));
    setDocument(next.document);
    setComments(next.comments);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [past, future, document, comments]);

  // Document Change Handler
  const handleDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => {
      saveToHistory(newValue, comments);
    }, 1000);
    setDocument(newValue);
  };

  // Helper: Find text position
  const findTextByPhrases = (startPhrase: string, endPhrase: string, doc: string) => {
    const startIndex = doc.indexOf(startPhrase);
    if (startIndex === -1) return null;
    const searchStart = startIndex + startPhrase.length;
    const endPhraseIndex = doc.indexOf(endPhrase, searchStart);
    
    if (endPhraseIndex === -1) {
      if (startPhrase.includes(endPhrase) || endPhrase.includes(startPhrase)) {
        return { startIndex, endIndex: startIndex + startPhrase.length, matchedText: startPhrase };
      }
      return null;
    }
    const endIndex = endPhraseIndex + endPhrase.length;
    return { startIndex, endIndex, matchedText: doc.substring(startIndex, endIndex) };
  };

  // Helper: Chunk document
  const chunkDocument = (text: string): string[] => {
    const paragraphs = text.split(/\n\n+/);
    const chunks: string[] = [];
    let currentChunk = "";
    for (const para of paragraphs) {
      if (currentChunk.length + para.length > 2000 && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = para;
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + para;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks.length > 0 ? chunks : [text];
  };

  // Analysis Logic
  const handleAnalyze = async () => {
    if (!document.trim()) {
      setError("Please enter some text to analyze");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setComments([]);
    setOverallAssessment(null);
    setActiveCommentId(null);

    try {
      // Overall Assessment
      const overallResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, customInstructions: customInstructions.trim() || undefined, mode: "overall" }),
      });

      if (overallResponse.ok && overallResponse.body) {
        const reader = overallResponse.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let text = "";

        // Manually create the object for UI to render
        setOverallAssessment({ summary: "" });

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value, { stream: true });
          text += chunkValue;
          
          // Keep updating the overall assessment object so state is consistent
          setOverallAssessment({ summary: text });
        }
      }

      // Chunk Analysis
      const chunks = chunkDocument(document);
      const allComments: any[] = [];
      for (const chunk of chunks) {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document: chunk, customInstructions: customInstructions.trim() || undefined, mode: "chunk" }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.comments) allComments.push(...data.comments);
        }
      }

      // Process Positions
      const commentsWithPositions = allComments
        .map((c: any, i: number) => {
          const match = findTextByPhrases(c.start_phrase, c.end_phrase, document);
          return {
            ...c,
            id: `comment-${Date.now()}-${i}`,
            startIndex: match?.startIndex ?? -1,
            endIndex: match?.endIndex ?? -1,
            quoted_text: match?.matchedText ?? "",
          };
        })
        .filter((c) => c.startIndex !== -1);

      setComments(commentsWithPositions);
      // Automatically select first comment if available
      if (commentsWithPositions.length > 0) {
        setActiveCommentId(commentsWithPositions[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Edit/Dismiss Logic
  const applyEdit = (comment: Comment) => {
    if (!comment.suggested_edit || comment.startIndex === undefined || comment.endIndex === undefined) return;
    saveToHistory(document, comments);

    const before = document.substring(0, comment.startIndex);
    const after = document.substring(comment.endIndex);
    const newDocument = before + comment.suggested_edit + after;

    setDocument(newDocument);

    // Calc shift for subsequent comments
    const originalLength = comment.endIndex - comment.startIndex;
    const lengthDiff = comment.suggested_edit.length - originalLength;

    setComments((prev) => {
      const remaining = prev.filter((c) => c.id !== comment.id);
      return remaining.map((c) => {
        if (c.startIndex !== undefined && c.startIndex > comment.endIndex!) {
          return { ...c, startIndex: c.startIndex + lengthDiff, endIndex: c.endIndex! + lengthDiff };
        }
        return c;
      });
    });
    
    // Advance to next comment
    advanceToNextComment(comment.id);
  };

  const dismissComment = (commentId: string) => {
    saveToHistory(document, comments);
    setComments(prev => prev.filter(c => c.id !== commentId));
    advanceToNextComment(commentId);
  };

  const advanceToNextComment = (currentId: string) => {
    const currentIndex = sortedComments.findIndex(c => c.id === currentId);
    if (currentIndex !== -1 && currentIndex < sortedComments.length - 1) {
      const nextComment = sortedComments[currentIndex + 1];
      setActiveCommentId(nextComment.id);
      scrollToText(nextComment.startIndex || 0);
      scrollToCommentCard(nextComment.id);
    } else {
      setActiveCommentId(null);
    }
  };

  // Navigation
  const scrollToText = (startIndex: number) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(startIndex, startIndex);
      // Rough scroll calculation
      const textBefore = document.substring(0, startIndex);
      const lines = textBefore.split("\n").length;
      const lineHeight = 32; // Updated line height
      const targetTop = (lines - 1) * lineHeight;
      
      textareaRef.current.scrollTo({
        top: Math.max(0, targetTop - 150),
        behavior: "smooth",
      });
    }
  };

  const scrollToCommentCard = (commentId: string) => {
    const card = window.document.getElementById(`card-${commentId}`);
    if (card && commentsListRef.current) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleCommentClick = (comment: Comment) => {
    setActiveCommentId(comment.id);
    if (comment.startIndex !== undefined) scrollToText(comment.startIndex);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col font-sans">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Analysis Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Custom Instructions</label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="E.g., Focus on professional tone..."
                  className="w-full h-32 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none text-sm"
                />
              </div>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm text-zinc-600 font-medium">Cancel</button>
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <h1 className="font-semibold text-zinc-900 dark:text-zinc-100">
              <ShinyText text="WriteGuide" speed={3} className="font-bold" />
            </h1>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <button onClick={undo} disabled={past.length === 0} className="p-1.5 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 rounded-md transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </button>
                <button onClick={redo} disabled={future.length === 0} className="p-1.5 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 rounded-md transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
                </button>
             </div>
             
             <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

             <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
             >
               Settings
             </button>
             
             <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !document.trim()}
              className="px-5 py-2 text-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              {isAnalyzing ? "Analyzing..." : "Analyze Text"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 relative flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto p-8 md:p-12 relative scrollbar-hide">
            <div className="max-w-3xl mx-auto relative min-h-[500px]">
              
              {/* Highlight Overlay */}
              
              <div className="absolute inset-0 pointer-events-none" style={{ padding: '0px' }}>
                <div
                  className="whitespace-pre-wrap wrap-break-word text-lg leading-loose font-serif text-transparent pl-8"
                  style={{ fontFamily: '"Merriweather", "Georgia", serif' }}
                >
                  {document.split("").map((char, idx) => {
                    const comment = comments.find(c =>
                      c.startIndex !== undefined && c.endIndex !== undefined && idx >= c.startIndex && idx < c.endIndex
                    );

                    if (comment) {
                      const isActive = activeCommentId === comment.id;
                      const isHigh = comment.impact === 'high';
                      const isStart = comment.startIndex === idx;

                      let decorationClass = "";
                      if (isActive) {
                        decorationClass = "border-b-2 border-blue-500";
                      } else {
                        decorationClass = isHigh
                          ? "border-b border-red-300/60"
                          : "border-b border-blue-200/60";
                      }

                      return (
                        <span key={idx} className={`${decorationClass} transition-all duration-200 relative`}>
                          {isStart && (
                            <span 
                              className={`absolute left-0 transform -translate-x-10 w-1.5 h-6 rounded-full transition-all duration-200 ${
                                isActive 
                                  ? 'bg-blue-500 scale-110' 
                                  : isHigh ? 'bg-red-300/60' : 'bg-blue-200/60'
                              }`}
                              style={{ top: '2px' }}
                            />
                          )}
                          {char}
                        </span>
                      );
                    }
                    return <span key={idx}>{char}</span>;
                  })}
                </div>
              </div>

              {/* Text Input */}
                <textarea
                  ref={textareaRef}
                  value={document}
                  onChange={handleDocumentChange}
                  onClick={(e) => {
                     // Try to detect click on comment
                     const target = e.target as HTMLTextAreaElement;
                     const index = target.selectionStart;
                     const clickedComment = comments.find(c => 
                       c.startIndex !== undefined && c.endIndex !== undefined && index >= c.startIndex && index <= c.endIndex
                     );
                     if (clickedComment) {
                       setActiveCommentId(clickedComment.id);
                       scrollToCommentCard(clickedComment.id);
                     }
                  }}
                  placeholder="Paste your draft here to get started..."
                  className="w-full h-full min-h-[60vh] bg-transparent text-zinc-900 dark:text-zinc-100 text-lg leading-loose font-serif border-none focus:ring-0 p-0 pl-8 resize-none outline-none relative z-10 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  style={{ fontFamily: '"Merriweather", "Georgia", serif' }}
                />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[340px] bg-zinc-50/50 flex flex-col h-[calc(100vh-64px)] z-10">
          
          {/* Chat / Overall Feedback Area */}
          <div className="p-6 shrink-0">
             {isAnalyzing && !overallAssessment ? (
                <div className="flex items-center gap-2 text-zinc-500">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150" />
                    <span className="text-xs ml-2 font-medium">Thinking...</span>
                </div>
             ) : overallAssessment ? (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold">W</div>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Editor</span>
                    </div>
                    <p className="text-sm text-zinc-900 leading-relaxed font-medium">
                        <Typewriter text={overallAssessment.summary} speed={5} />
                    </p>
                </div>
             ) : (
                <div className="text-sm text-zinc-500 italic">
                    Ready to review your draft.
                </div>
             )}
          </div>

          {/* Comments List */}
          <div ref={commentsListRef} className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-hide">
            
            {sortedComments.length > 0 && (
                <div className="flex items-center justify-between px-2 pb-2">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Suggestions</span>
                    <div className="flex gap-1">
                        {(['all', 'high'] as const).map((filter) => (
                            <button
                            key={filter}
                            onClick={() => setFilterImpact(filter)}
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-full capitalize transition-all ${
                                filterImpact === filter
                                ? "bg-zinc-200 text-zinc-800"
                                : "text-zinc-400 hover:text-zinc-600"
                            }`}
                            >
                            {filter}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {sortedComments.map((comment) => {
              const isActive = activeCommentId === comment.id;
              
              // If active, show full card
              if (isActive) {
                  return (
                    <div
                        key={comment.id}
                        id={`card-${comment.id}`}
                        className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 ring-1 ring-blue-500/20 animate-in zoom-in-95 duration-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            comment.impact === 'high' ? 'bg-red-50 text-red-600' :
                            comment.impact === 'medium' ? 'bg-amber-50 text-amber-600' :
                            'bg-blue-50 text-blue-600'
                            }`}>
                            {comment.category}
                            </span>
                            <div className="flex gap-1">
                                <button onClick={(e) => { e.stopPropagation(); dismissComment(comment.id); }} className="p-1 hover:bg-zinc-50 rounded text-zinc-400 hover:text-zinc-600 transition-colors" title="Dismiss">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-sm text-zinc-900 mb-3 leading-relaxed font-medium">
                            {comment.feedback}
                        </p>

                        {comment.suggested_edit && (
                            <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                                <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Try this</div>
                                <div className="text-sm text-zinc-900 font-medium mb-3">
                                    {comment.suggested_edit}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); applyEdit(comment); }}
                                    className="w-full bg-white hover:bg-zinc-50 text-blue-600 border border-blue-200 hover:border-blue-300 text-xs font-semibold py-2 px-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
                                >
                                    <span>Apply Fix</span>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                  );
              }

              // Collapsed state
              return (
                <div
                    key={comment.id}
                    id={`card-${comment.id}`}
                    onClick={() => handleCommentClick(comment)}
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-all"
                >
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        comment.impact === 'high' ? 'bg-red-400' :
                        comment.impact === 'medium' ? 'bg-amber-400' :
                        'bg-blue-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-600 truncate group-hover:text-zinc-900 transition-colors font-medium">
                            {comment.feedback}
                        </p>
                    </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
