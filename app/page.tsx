"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "./components/Header";
import { Sparkles, ArrowRight, PenTool, Zap, Eye, Check, CornerDownRight } from "lucide-react";
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
        <section className="relative min-h-screen flex items-center pt-20 px-6 overflow-hidden">
          {/* Subtle Ambient Light */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-indigo-500/8 blur-[140px] rounded-full -z-10" />
          
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left: Content */}
            <div className="space-y-10 animate-in fade-in slide-in-from-left-10 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/3 border border-white/8 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                The Professional Writing Studio
              </div>
              
              <h1 className="text-6xl md:text-8xl xl:text-9xl font-bold tracking-tight leading-[0.85] text-white">
                Write better, <br />
                <span className="text-transparent bg-clip-text bg-linear-to-b from-white to-white/20 italic">faster.</span>
              </h1>
              
              <p className="max-w-lg text-lg md:text-xl text-white/40 leading-relaxed font-medium">
                A simple editor that helps you clear up your thoughts. 
                Get instant feedback so you never have to second-guess a sentence again.
              </p>

              <div className="flex flex-col items-start gap-6 pt-4">
                <SignedOut>
                  <Link href="/sign-up">
                    <button className="px-10 py-5 bg-white text-black text-sm font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)]">
                      Start Writing Free
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

            {/* Right: Animation */}
            <div className="relative hidden lg:block animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
              <MockEditorAnimation />
            </div>
          </div>
        </section>
... rest of file ...

        {/* The "Consumer" Value Section */}
        <section className="py-32 px-6 border-t border-white/3">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <ValueProp 
                icon={<Zap className="w-5 h-5 text-indigo-400" />}
                title="Smart Suggestions"
                description="Get simple tips to improve your flow and grammar. We highlight the issues, you stay in control."
              />
              <ValueProp 
                icon={<PenTool className="w-5 h-5 text-indigo-400" />}
                title="Keep Your Voice"
                description="It's your writing, just clearer. We help you find the best version of your own words."
              />
              <ValueProp 
                icon={<Eye className="w-5 h-5 text-indigo-400" />}
                title="Zero Clutter"
                description="No menus, no toolbars, no distractions. Just a clean page for your best thinking."
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

function MockEditorAnimation() {
  const [text, setText] = useState("");
  const [phase, setStep] = useState(0); // 0: typing, 1: highlight, 2: suggestion, 3: apply, 4: wait
  
  const fullText = "The productivity was very low due to various different factors.";
  const highlightedPart = "various different";
  const suggestion = "several";

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (phase === 0) {
      if (text.length < fullText.length) {
        timeout = setTimeout(() => {
          setText(fullText.slice(0, text.length + 1));
        }, 40);
      } else {
        timeout = setTimeout(() => setStep(1), 1000);
      }
    } else if (phase === 1) {
      timeout = setTimeout(() => setStep(2), 800);
    } else if (phase === 2) {
      timeout = setTimeout(() => setStep(3), 2500);
    } else if (phase === 3) {
      timeout = setTimeout(() => {
        setText(fullText.replace(highlightedPart, suggestion));
        setStep(4);
      }, 500);
    } else if (phase === 4) {
      timeout = setTimeout(() => {
        setText("");
        setStep(0);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [text, phase]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative p-1 bg-linear-to-b from-white/10 to-transparent rounded-[32px] shadow-2xl overflow-hidden">
        <div className="relative bg-[#0A0A0A] rounded-[30px] border border-white/5 p-10 min-h-[400px] flex flex-col justify-center">
          {/* Editor Content */}
          <div className="font-serif text-2xl md:text-3xl leading-relaxed text-white/90">
            {phase < 3 ? (
              <>
                {text.includes(highlightedPart) ? (
                  <>
                    {text.split(highlightedPart)[0]}
                    <span className={`relative inline transition-all duration-500 ${phase >= 1 ? 'bg-white/10 ring-1 ring-white/20 rounded-sm px-1' : ''}`}>
                      {phase >= 1 && (
                        <span className="absolute -top-8 left-0 flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-lg animate-in fade-in zoom-in duration-300">
                          <Zap className="w-3 h-3 text-black" />
                        </span>
                      )}
                      {highlightedPart}
                    </span>
                    {text.split(highlightedPart)[1]}
                  </>
                ) : (
                  text
                )}
              </>
            ) : (
              text
            )}
            <span className="w-[2px] h-[1em] bg-indigo-500 inline-block align-middle ml-1 animate-pulse" />
          </div>

          {/* Suggestion Tooltip */}
          {phase === 2 && (
            <div className="absolute top-[60%] left-[10%] right-[10%] z-30 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-[0_30px_90px_rgba(0,0,0,0.9)] space-y-4">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400">CLARITY</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>SUGGESTION</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white/90 leading-tight">
                  Remove redundancy for better flow.
                </p>
                <div className="space-y-3">
                  <div className="text-[13px] text-white/30 line-through italic">
                    "{highlightedPart}"
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <CornerDownRight className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                    <span className="text-base font-medium">"{suggestion}"</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xl">
                    <Check className="w-4 h-4" />
                    Apply Fix
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative Glow behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[100px] -z-10" />
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
