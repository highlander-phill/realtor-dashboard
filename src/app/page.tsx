"use client";

export const runtime = "edge";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Rocket, 
  Shield, 
  TrendingUp, 
  Users, 
  Zap, 
  Check, 
  BarChart3, 
  PieChart, 
  Lock,
  ArrowRight,
  Globe,
  MousePointer2,
  Tv
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [teamId, setTeamId] = useState("");
  const router = useRouter();

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamId) {
      router.push(`/${teamId.toLowerCase()}`);
    }
  };

  const features = [
    {
      title: "Real-Time Tracking",
      description: "Live updates on volume, closings, and pending deals across your entire roster.",
      icon: TrendingUp,
      color: "bg-blue-500"
    },
    {
      title: "Multi-Industry Themes",
      description: "Tailored nomenclature for Real Estate, Insurance, and General Sales teams.",
      icon: Globe,
      color: "bg-purple-500"
    },
    {
      title: "TV Mode Optimized",
      description: "Designed for office displays with auto-refreshing metrics and high-visibility charts.",
      icon: Tv,
      color: "bg-green-500"
    },
    {
      title: "Agent Profiles",
      description: "Individual drill-downs with detailed transaction history and goal progress.",
      icon: Users,
      color: "bg-orange-500"
    },
    {
      title: "Secure Management",
      description: "Admin consoles protected by modern security for every individual dashboard.",
      icon: Shield,
      color: "bg-red-500"
    },
    {
      title: "Instant Provisioning",
      description: "No DNS headaches. Create a new team dashboard in seconds with path-based routing.",
      icon: Zap,
      color: "bg-yellow-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/20">TG</div>
            <span className="font-black text-2xl tracking-tighter uppercase italic">Team<span className="text-blue-500">Goals</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Button variant="outline" onClick={() => router.push('/master')} className="border-slate-800 hover:bg-slate-900 text-slate-300">
              Master Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 px-4 py-2 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
              <Zap className="w-3 h-3" /> Now in Public Beta
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic">
              Performance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Visualized.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              The high-performance dashboard for modern sales teams. Track goals, visualize volume, and dominate your industry in real-time.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-slate-900/50 border-slate-800 shadow-2xl p-2 rounded-[32px] backdrop-blur-xl">
              <CardContent className="p-0">
                <form onSubmit={handleGo} className="flex gap-2">
                  <Input 
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    placeholder="Enter team ID (e.g. nspg)"
                    className="h-16 bg-transparent border-none text-white text-xl font-bold focus:ring-0 px-6 placeholder:text-slate-600"
                  />
                  <Button type="submit" className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 group">
                    GO <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </CardContent>
            </Card>
            <p className="text-[10px] uppercase font-bold text-slate-600 mt-4 tracking-[0.3em]">Instantly access your team's live data</p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Built for Growth</h2>
            <p className="text-slate-500 font-medium">Everything your team needs to stay focused on the numbers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] space-y-6 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold uppercase italic tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Demo Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-600 to-purple-700 border-none rounded-[40px] overflow-hidden shadow-2xl shadow-blue-500/10">
            <CardContent className="p-12 md:p-20 text-center space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                  Simple, Transparent <br />Pricing
                </h2>
                <p className="text-blue-100 text-xl font-medium">No hidden fees. No complicated tiers.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-8 inline-block border border-white/20">
                <div className="flex items-center gap-4 text-left">
                  <div className="space-y-0">
                    <p className="text-5xl font-black text-white">$1</p>
                    <p className="text-blue-200 font-bold uppercase text-xs tracking-widest">per month / team</p>
                  </div>
                  <div className="w-px h-12 bg-white/20 mx-4" />
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-white flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-400" /> 30-Day Free Trial
                    </p>
                    <p className="text-blue-100/70 text-sm font-medium">Full access to all features</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl">
                  Start Your Free Trial
                </Button>
                <p className="text-blue-100/50 text-xs font-bold mt-6 uppercase tracking-widest">No credit card required to start</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black shadow-lg">TG</div>
            <span className="font-black text-xl tracking-tighter uppercase italic">TeamGoals</span>
          </div>
          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">
            © 2026 TeamGoals Platform • Built for high-performance teams.
          </p>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
             <a href="mailto:hello@team-goals.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
