"use client";

export const runtime = "edge";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { Shield, Lock, ArrowRight, AlertCircle, Key } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Turnstile from "@/components/Turnstile";
import { motion, AnimatePresence } from "framer-motion";

function MasterLoginContent() {
  const [showManual, setShowManual] = useState(false);
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/master/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, turnstileToken }),
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = "/master";
      } else {
        setError(data.error || "Invalid master password.");
      }
    } catch (err) {
      setError("Connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2),transparent_50%)] pointer-events-none" />
      
      <div className="w-full max-w-md">
        <Card className="bg-slate-900 border-white/10 shadow-2xl rounded-[32px] overflow-hidden">
          <CardHeader className="pt-12 pb-8 text-center space-y-4">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/20 mb-2">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-1">
               <CardTitle className="text-3xl font-black text-white uppercase italic tracking-tight">Master Control</CardTitle>
               <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Restricted Platform Access</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-10 pb-10 space-y-8">
            <Button 
              onClick={() => signIn("google", { callbackUrl: "/master" })} 
              className="w-full h-16 bg-white hover:bg-slate-100 text-slate-900 font-black uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>
              Super Admin Google Login
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-600 tracking-[0.3em]">
                <span className="bg-slate-900 px-4">Internal Recovery</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!showManual ? (
                <div key="toggle">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowManual(true)}
                    className="w-full text-slate-500 hover:text-white font-bold uppercase text-[10px] tracking-widest h-12"
                  >
                    Use Master Password <Lock className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              ) : (
                <form
                  key="form"
                  onSubmit={handleManualLogin}
                  className="space-y-4"
                >
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-tight">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-slate-500 font-black uppercase text-[9px] tracking-widest px-1">Global System Password</Label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 pl-12 bg-slate-950 border-white/5 text-white font-bold rounded-2xl focus:ring-blue-600"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-center py-2">
                     <Turnstile onVerify={setTurnstileToken} />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-14 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                  >
                    {isLoading ? "Verifying..." : "Access System"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowManual(false)}
                    className="w-full text-slate-600 text-[9px] font-black uppercase tracking-[0.2em]"
                  >
                    Cancel
                  </Button>
                </form>
              )}
            </AnimatePresence>
          </CardContent>
          
          <CardFooter className="pb-10 justify-center">
             <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">TeamGoals Engine v2.3.1</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function MasterLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <MasterLoginContent />
    </Suspense>
  );
}
