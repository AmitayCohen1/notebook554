"use client";

import React from "react";
import Link from "next/link";
import { Header } from "./components/Header";
import { Sparkles, ArrowRight, ShieldCheck, Zap, MessageSquare } from "lucide-react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";

export default function LandingPage() {
  const { user, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-app))] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Header 
        wordCount={0} 
        suggestionsCount={0} 
        hasAnalyzed={false}
        showWritingTools={false}
      />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
          
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              Writing Re-imagined
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-white">
              Write like you <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-white to-white/40">mean it.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/50 leading-relaxed font-medium">
              Cinematic AI writing assistant that audits your prose in real-time. 
              Focus on your thoughts while we handle the precision.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <SignedOut>
                <Link href="/sign-up">
                  <button className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    Start Writing Free
                  </button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/editor">
                  <button className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    Open Editor
                  </button>
                </Link>
              </SignedIn>
              
              <Link href="/sign-in">
                <button className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 border border-white/10 transition-all">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Real-time Audit"
              description="Surgical edits for grammar, clarity, and style delivered through an immersive interface."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Neon Secure"
              description="Your documents are stored in highly-available, secure Neon database with auto-save."
            />
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6" />}
              title="Cinematic UX"
              description="A writing environment designed for flow, not distraction. Pure black, pure focus."
            />
          </div>
        </section>

        {/* Preview Image / Mockup */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="aspect-video w-full bg-[hsl(var(--bg-sheet))] rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-12">
                <div className="w-full h-full flex flex-col gap-6">
                  <div className="h-4 w-1/3 bg-white/10 rounded-full" />
                  <div className="h-4 w-2/3 bg-white/10 rounded-full" />
                  <div className="h-4 w-1/2 bg-white/10 rounded-full" />
                  <div className="mt-12 h-32 w-full bg-white/5 rounded-2xl border border-white/5 p-6 relative">
                    <div className="absolute -top-3 left-6 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-black" />
                    </div>
                    <div className="h-2 w-3/4 bg-white/20 rounded-full" />
                    <div className="mt-4 h-2 w-1/2 bg-white/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-white/30 text-sm font-medium uppercase tracking-widest">
          <div>© 2025 WriteGuide Studio</div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 hover:bg-white/[0.07] transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      <p className="text-white/40 leading-relaxed font-medium text-sm">
        {description}
      </p>
    </div>
  );
}

