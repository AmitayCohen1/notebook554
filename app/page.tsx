"use client";

import React from "react";
import Link from "next/link";
import { Header } from "./components/Header";
import { Sparkles, ArrowRight, PenTool, Zap, Eye } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Header 
        wordCount={0} 
        suggestionsCount={0} 
        hasAnalyzed={false}
        showWritingTools={false}
      />

      <main>
        {/* Cinematic Hero */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
          {/* Subtle Ambient Light */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-indigo-500/8 blur-[140px] rounded-full -z-10" />
          
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/3 border border-white/8 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
              The Professional Writing Studio
            </div>
            
            <h1 className="text-7xl md:text-[120px] font-bold tracking-tight leading-[0.85] text-white">
              Write better, <br />
              <span className="text-transparent bg-clip-text bg-linear-to-b from-white to-white/20 italic">faster.</span>
            </h1>
            
            <p className="max-w-xl mx-auto text-lg md:text-xl text-white/40 leading-relaxed font-medium">
              A simple editor that helps you clear up your thoughts. <br />
              Get instant feedback so you never have to second-guess a sentence again.
            </p>

            <div className="flex flex-col items-center gap-6 pt-6">
              <SignedOut>
                <Link href="/sign-up">
                  <button className="px-10 py-5 bg-white text-black text-sm font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)]">
                    Start Writing
                  </button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/editor">
                  <button className="px-10 py-5 bg-white text-black text-sm font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)]">
                    Open Your Studio
                  </button>
                </Link>
              </SignedIn>
              
              <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-white/20">
                <span>Free forever</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span>Unlimited Audits</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span>No distractions</span>
              </div>
            </div>
          </div>
        </section>

        {/* The "Consumer" Value Section */}
        <section className="py-32 px-6 border-t border-white/3">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <ValueProp 
                icon={<Zap className="w-5 h-5 text-indigo-400" />}
                title="Instant Feedback"
                description="Get sentence-by-sentence suggestions to improve your flow, grammar, and impact as you type."
              />
              <ValueProp 
                icon={<PenTool className="w-5 h-5 text-indigo-400" />}
                title="Your Voice, Only Better"
                description="We don't rewrite your work. We just help you find the clearest version of your own unique words."
              />
              <ValueProp 
                icon={<Eye className="w-5 h-5 text-indigo-400" />}
                title="Total Focus"
                description="A clean, cinematic workspace designed for deep work. No clutter, no toolbars, just your thoughts."
              />
            </div>
          </div>
        </section>

        {/* Minimal Preview */}
        <section className="pb-40 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative p-1 bg-linear-to-b from-white/8 to-transparent rounded-[40px]">
              <div className="aspect-video w-full bg-[#0A0A0A] rounded-[38px] border border-white/5 shadow-2xl overflow-hidden flex items-center justify-center p-20">
                <div className="w-full max-w-md space-y-8 animate-pulse">
                  <div className="h-2 w-3/4 bg-white/3 rounded-full" />
                  <div className="h-2 w-full bg-white/3 rounded-full" />
                  <div className="h-2 w-1/2 bg-white/3 rounded-full" />
                  <div className="pt-12">
                    <div className="h-24 w-full bg-indigo-500/2 border border-indigo-500/10 rounded-2xl flex items-center px-6">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-white/3 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black">
              <PenTool className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">WriteGuide Studio</span>
          </div>
          
          <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
            <Link href="#" className="hover:text-white transition-colors">Process</Link>
            <Link href="#" className="hover:text-white transition-colors">Journal</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          </div>
          
          <div className="text-[10px] font-medium text-white/10 italic">
            Engineered for clarity.
          </div>
        </div>
      </footer>
    </div>
  );
}

function ValueProp({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="space-y-6 group">
      <div className="w-10 h-10 rounded-xl bg-white/3 border border-white/8 flex items-center justify-center group-hover:border-white/20 transition-all">
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-white/40 leading-relaxed font-medium text-[15px]">
          {description}
        </p>
      </div>
    </div>
  );
}
