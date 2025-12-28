"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Feather } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

interface HeaderProps {
  wordCount: number;
  suggestionsCount: number;
  hasAnalyzed: boolean;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  isSaving?: boolean;
  showWritingTools?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  wordCount,
  suggestionsCount,
  hasAnalyzed,
  onAnalyze,
  isAnalyzing,
  isSaving,
  showWritingTools = true,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-6 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black group-hover:scale-110 transition-transform shadow-xl">
            <Feather className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">Notebook554</span>
        </Link>

        <SignedIn>
          <div className="h-4 w-px bg-white/10" />
          <nav className="flex items-center gap-4">
            <Link href="/editor">
              <button className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                Editor
              </button>
            </Link>
          </nav>
        </SignedIn>
      </div>

      <div className="flex items-center gap-4">
        {showWritingTools && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 text-[11px] font-medium text-white/50">
            <span>{wordCount.toLocaleString()} words</span>
            {isSaving ? (
              <span className="text-white/30 animate-pulse">Saving...</span>
            ) : (
              <span className="text-white/30 text-[9px]">Saved</span>
            )}
            {suggestionsCount > 0 && (
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold border-l border-white/10 pl-3">
                <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                {suggestionsCount} issues
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {showWritingTools && onAnalyze && (
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`
                relative flex items-center gap-2 px-5 py-2 rounded-full font-bold text-xs transition-all overflow-hidden
                ${isAnalyzing 
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" 
                  : "bg-white text-black hover:bg-white/90 shadow-lg"
                }
              `}
            >
              {isAnalyzing ? (
                <>
                  <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                  <div className="w-3 h-3 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin shrink-0" />
                  <span className="relative">Analyzing Prose...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Check Writing</span>
                </>
              )}
            </button>
          )}

          {!showWritingTools && (
            <Link href="/editor">
              <button className="flex items-center gap-2 px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl">
                Open App
              </button>
            </Link>
          )}

          <div className="h-8 w-px bg-white/10 mx-1" />

          <SignedOut>
            <Link href="/sign-in">
              <button className="text-xs font-bold text-white/70 hover:text-white transition-colors px-4 py-1.5 border border-white/10 rounded-full bg-white/5">
                Sign In
              </button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 rounded-lg"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};
