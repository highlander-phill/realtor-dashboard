"use client";

export const runtime = "edge";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, ChevronLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Turnstile from "@/components/Turnstile";

export default function AdminLogin() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      turnstileToken,
      redirect: false,
      callbackUrl: `/${subdomain}/admin`,
    });
    if (result?.error) {
      setError("Invalid email, password, or security check.");
    } else {
      router.push(`/${subdomain}/admin`);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: `/${subdomain}/admin` });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Link href={`/${subdomain}`} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <Card className="bg-slate-900 border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-black text-white uppercase tracking-tight">Admin Login</CardTitle>
            <CardDescription className="text-slate-400">Manage {subdomain} performance</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">Email</Label>
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white h-14 rounded-2xl text-xl font-bold tracking-widest focus:ring-blue-600"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">Password</Label>
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white h-14 rounded-2xl text-xl font-bold tracking-widest focus:ring-blue-600"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Turnstile onVerify={(token: string) => setTurnstileToken(token)} />
              <div className="flex justify-end">
                <Link href={`/${subdomain}/admin/forgot-password`} className="text-slate-400 hover:text-white text-xs">Forgot password?</Link>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95">
                Sign In
              </Button>
            </form>
            <div className="mt-6">
                <Button onClick={handleGoogleLogin} className="w-full bg-slate-800 hover:bg-slate-700 text-white h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-95">
                  Sign in with Google
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
