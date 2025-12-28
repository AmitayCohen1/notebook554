"use client";

import { SignUp } from "@clerk/nextjs";
import { Feather } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--bg-app))] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Cinematic Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full" />

      {/* Header / Logo */}
      <div className="absolute top-12 left-12">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black group-hover:scale-110 transition-transform shadow-xl">
            <Feather className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-white/80 transition-colors">WriteGuide</span>
        </Link>
      </div>

      <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Join the Studio</h1>
          <p className="text-white/50 font-medium">Start writing like you mean it.</p>
        </div>

        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: "bg-white hover:bg-white/90 text-black font-bold text-sm h-12 rounded-xl transition-all shadow-xl",
              card: "bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl rounded-3xl p-8",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold h-12 rounded-xl transition-all",
              socialButtonsBlockButtonText: "text-white font-bold",
              formFieldLabel: "text-white/50 font-bold uppercase tracking-widest text-[10px] mb-2",
              formFieldInput: "bg-white/5 border border-white/10 focus:border-white/30 text-white h-12 rounded-xl transition-all px-4",
              footerActionText: "text-white/40 font-medium",
              footerActionLink: "text-indigo-400 hover:text-indigo-300 font-bold transition-colors",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-white/50",
              formResendCodeLink: "text-indigo-400 font-bold",
              dividerLine: "bg-white/10",
              dividerText: "text-white/20 font-bold uppercase text-[10px]",
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/editor"
        />
      </div>
    </div>
  );
}

