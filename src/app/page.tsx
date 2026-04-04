"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Shield, TrendingUp, Users } from "lucide-react";

export default function LandingPage() {
  const [teamId, setTeamId] = useState("");
  const router = useRouter();

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamId) {
      router.push(`/${teamId.toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl space-y-12">
        <div className="space-y-4">
          <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-4 shadow-lg shadow-blue-900/40">
            Performance Tracking for Modern Teams
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            TEAM<span className="text-blue-600">GOALS</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            The visual sales dashboard for high-performance teams. Real-time metrics, individual agent tracking, and multi-industry support.
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800 shadow-2xl p-2 rounded-3xl max-w-md mx-auto">
          <CardContent className="p-0">
            <form onSubmit={handleGo} className="flex gap-2">
              <Input 
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="Enter your team ID..."
                className="h-16 bg-transparent border-none text-white text-xl font-bold focus:ring-0 px-6"
              />
              <Button type="submit" className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/20">
                GO
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 text-left">
          <div className="space-y-3 p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
             <h3 className="font-bold text-lg">Live Analytics</h3>
             <p className="text-sm text-slate-500">Track production, goals, and volume in real-time across your entire group.</p>
          </div>
          <div className="space-y-3 p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
             <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center"><Users className="w-5 h-5" /></div>
             <h3 className="font-bold text-lg">Agent Management</h3>
             <p className="text-sm text-slate-500">Drill down into individual performance with detailed transaction history.</p>
          </div>
          <div className="space-y-3 p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
             <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center"><Rocket className="w-5 h-5" /></div>
             <h3 className="font-bold text-lg">TV Dashboards</h3>
             <p className="text-sm text-slate-500">Designed for office monitors. Auto-refreshes and high-visibility displays.</p>
          </div>
        </div>

        <footer className="pt-20 text-slate-600 text-xs font-bold uppercase tracking-widest">
          © 2026 TeamGoals Platform • team-goals.com
        </footer>
      </div>
    </div>
  );
}
