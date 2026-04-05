"use client";

export const runtime = "edge";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Chrome, AlertCircle, ChevronLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Turnstile from "@/components/Turnstile";
import Link from "next/link";
import { motion } from "framer-motion";

function LoginContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  const error = searchParams.get("error");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setAuthError("Please complete the security check.");
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);
    const result = await signIn("credentials", {
      email,
      password,
      turnstileToken,
      subdomain,
      redirect: false,
    });

    if (result?.error) {
      setAuthError("Invalid credentials for this team dashboard.");
      setIsLoading(false);
    } else {
      router.push(`/${subdomain}/admin`);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: `/${subdomain}/admin` });
  };

  if (!subdomain || subdomain === "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-white/10 shadow-2xl rounded-[32px] overflow-hidden text-center p-12 space-y-6">
           <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
           </div>
           <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Access Denied</h2>
           <p className="text-slate-400 font-medium">To login to your dashboard, please visit your team URL first (e.g., team-goals.com/your-team).</p>
           <Link href="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest h-14 rounded-2xl">
                 Go to Homepage
              </Button>
           </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-6">
        <Link href={`/${subdomain}`} className="text-slate-500 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <Card className="bg-slate-900/50 border-white/10 shadow-2xl rounded-[32px] backdrop-blur-2xl overflow-hidden">
          <CardHeader className="pt-12 pb-8 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20 mb-2">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
               <CardTitle className="text-3xl font-black text-white uppercase italic tracking-tight">Admin Login</CardTitle>
               <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">{subdomain} Management Console</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-10 space-y-6">
            {(error || authError) && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-tight">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {authError || "Authentication failed."}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 font-bold rounded-2xl focus:ring-blue-600 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 font-bold rounded-2xl focus:ring-blue-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center py-2">
                 <Turnstile onVerify={setTurnstileToken} />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/40 transition-all group"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-600 tracking-[0.3em]">
                <span className="bg-slate-900/50 px-4">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={handleGoogleLogin}
              className="w-full h-14 border-white/5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl gap-3 transition-all"
            >
              <Chrome className="w-5 h-5 text-blue-400" />
              Google Workspace
            </Button>
          </CardContent>

          <CardFooter className="px-10 pb-12 pt-6 text-center flex flex-col gap-4">
             <Link href={`/${subdomain}/admin/forgot-password`} className="text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-widest transition-colors">
                Forgot Password?
             </Link>
             <div className="h-px w-12 bg-white/5 mx-auto" />
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Protected by TeamGoals Security
             </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginContent />
    </Suspense>
  );
}
