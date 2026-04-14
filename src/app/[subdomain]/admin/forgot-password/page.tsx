"use client";

export const runtime = "edge";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Mail, ChevronLeft, RefreshCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPassword() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email, subdomain }),
      });
      const result = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(result.message || result.error || "Failed to send reset email.");
      }
    } catch (e) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Link href={`/${subdomain}/admin/login`} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Login
        </Link>
        
        <Card className="bg-slate-900 border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
              <Mail className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-black text-white uppercase tracking-tight">Forgot Password</CardTitle>
            <CardDescription className="text-slate-400">Enter your email to reset your password</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            {submitted ? (
              <div className="space-y-6 text-center">
                <div className="p-6 bg-blue-600/10 border border-blue-600/20 rounded-2xl">
                  <p className="text-blue-400 font-bold">Check your inbox!</p>
                  <p className="text-slate-400 text-sm mt-2">If an account exists for <span className="text-white">{email}</span>, you will receive a temporary password shortly.</p>
                </div>
                <Link href={`/${subdomain}/admin/login`} className="block w-full">
                  <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white h-14 font-black uppercase tracking-widest rounded-2xl">
                    Return to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                {error && (
                  <p className="text-red-500 text-xs font-bold uppercase tracking-tight text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>
                )}
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95">
                  {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Send Reset Email"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
