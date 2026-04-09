"use client";

export const runtime = "edge";

import { useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Lock, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

function ResetPasswordContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  const token = searchParams.get('token');

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', token, password, subdomain }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push(`/${subdomain}/admin/login`), 3000);
      } else {
        const data = await res.json();
        alert(data.error || "Reset failed");
      }
    } catch (e) {
      alert("Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="p-8 text-white text-center">Invalid reset link.</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="bg-slate-900 border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-black text-white uppercase tracking-tight">Set New Password</CardTitle>
            <CardDescription className="text-slate-400">Secure your account with a new password</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            {success ? (
              <div className="text-center space-y-4">
                 <div className="flex justify-center"><CheckCircle2 className="w-12 h-12 text-green-500" /></div>
                 <p className="text-green-500 font-bold">Password reset successful!</p>
                 <p className="text-slate-400 text-sm">Redirecting you to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">New Password</Label>
                  <Input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white h-14 rounded-2xl text-xl font-bold tracking-widest focus:ring-blue-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">Confirm Password</Label>
                  <Input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white h-14 rounded-2xl text-xl font-bold tracking-widest focus:ring-blue-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95">
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
