"use client";

export const runtime = "edge";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Tv,
  Layout,
  Gauge,
  Activity,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [teamId, setTeamId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleGo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (teamId.trim()) {
      router.push(`/${teamId.toLowerCase()}/onboarding`);
    } else {
      inputRef.current?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      title: "Division Support",
      description: "Organize your roster into sub-teams with their own production goals.",
      icon: Layers,
      color: "bg-yellow-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden">
      
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-lg md:text-xl shadow-lg shadow-blue-600/20 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>TG</div>
            <span className="font-black text-xl md:text-2xl tracking-tighter uppercase italic">Team<span className="text-blue-500">Goals</span></span>
          </div>
          <div className="flex items-center gap-4 md:gap-8 text-sm font-bold uppercase tracking-widest text-slate-400">
            <a href="#features" className="hidden md:block hover:text-white transition-colors">Features</a>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 md:pt-48 pb-10 md:pb-20 px-4 md:px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] md:h-[800px] bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center space-y-12 md:space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-blue-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">
              <Activity className="w-2.5 h-2.5 md:w-3 h-3" /> The Professional Standard
            </div>
            <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.95] md:leading-[0.85] uppercase italic">
              Elite Sales <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">Leaderboards.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed px-4">
              Real-time performance tracking for modern sales teams. Visualize your goals, track every deal, and dominate your market with the professional standard in sales dashboards.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-lg mx-auto w-full px-4"
          >
            <Card className="bg-slate-900/50 border-white/10 shadow-2xl p-1 md:p-2 rounded-[32px] md:rounded-[40px] backdrop-blur-2xl">
              <CardContent className="p-0">
                <form onSubmit={handleGo} className="flex flex-col md:flex-row gap-2">
                  <Input 
                    ref={inputRef}
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                    placeholder="Enter your team name (no spaces)"
                    className="h-12 md:h-16 bg-transparent border-none text-white text-lg md:text-xl font-bold focus:ring-0 px-6 md:px-8 placeholder:text-slate-600"
                  />
                  <Button type="submit" className="h-12 md:h-16 px-8 md:px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] md:rounded-[32px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 group">
                    GO <ArrowRight className="w-4 h-4 md:w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div className="flex justify-center gap-6 mt-6">
               <p className="text-[10px] uppercase font-black text-slate-600 tracking-[0.3em]">Try it now:</p>
               <button onClick={() => router.push('/demo')} className="text-[10px] uppercase font-black text-purple-500 tracking-[0.3em] hover:text-purple-400 transition-colors">/demo</button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="demo" className="py-12 md:py-24 px-4 md:px-6 overflow-hidden">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16 space-y-4 px-4">
               <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight">Experience the Interface</h2>
               <p className="text-slate-500 font-medium">Toggle between real-world performance views.</p>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-blue-600/20 blur-[60px] md:blur-[120px] rounded-full -z-10" />
               <motion.div 
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="bg-slate-900/80 border border-white/10 rounded-[32px] md:rounded-[48px] p-2 md:p-4 shadow-2xl backdrop-blur-xl overflow-x-auto no-scrollbar"
               >
                  <div className="bg-slate-950 rounded-[28px] md:rounded-[40px] overflow-hidden border border-white/5 min-w-[320px] md:min-w-0">
                     <div className="h-10 md:h-12 border-b border-white/5 bg-white/5 flex items-center px-4 md:px-6 gap-2">
                        <div className="flex gap-1.5">
                           <div className="w-2.5 h-2.5 md:w-3 h-3 rounded-full bg-red-500/50" />
                           <div className="w-2.5 h-2.5 md:w-3 h-3 rounded-full bg-yellow-500/50" />
                           <div className="w-2.5 h-2.5 md:w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="mx-auto bg-white/5 px-3 md:px-4 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold text-slate-500 tracking-tight flex items-center gap-2 truncate max-w-[150px] md:max-w-none">
                           <Lock className="w-2 h-2" /> team-goals.com/demo
                        </div>
                     </div>
                     <div className="p-4 md:p-12 space-y-8 md:space-y-10 origin-top scale-[0.85] md:scale-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg md:text-xl shadow-lg shadow-blue-600/20">NS</div>
                              <div className="space-y-1">
                                 <div className="h-6 md:h-7 w-40 md:w-56 bg-white/10 rounded-lg animate-pulse" />
                                 <div className="h-2.5 md:h-3 w-24 md:w-32 bg-white/5 rounded-md" />
                              </div>
                           </div>
                           <div className="flex gap-2 w-full md:w-auto">
                              <div className="h-9 md:h-10 flex-1 md:w-24 bg-white/5 rounded-xl border border-white/10" />
                              <div className="h-9 md:h-10 flex-1 md:w-32 bg-blue-600/20 rounded-xl border border-blue-500/20" />
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                           <div className="lg:col-span-3 bg-white/5 rounded-[32px] md:rounded-[40px] border border-white/10 p-6 md:p-10 space-y-8 md:space-y-10">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                 <div className="space-y-3 md:space-y-4">
                                    <div className="h-3 w-32 bg-blue-500/20 rounded-full" />
                                    <div className="text-4xl md:text-6xl font-black italic tracking-tighter">$22,450,000</div>
                                 </div>
                                 <div className="text-left md:text-right space-y-1 md:space-y-2">
                                    <div className="h-2 w-24 bg-white/10 rounded-full md:ml-auto" />
                                    <div className="text-3xl md:text-4xl font-black text-blue-500">45%</div>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    <span>Production Progress</span>
                                    <span>Goal: $50,000,000</span>
                                 </div>
                                 <div className="h-4 md:h-6 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      whileInView={{ width: '45%' }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                      className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
                                    />
                                 </div>
                              </div>
                           </div>
                           
                           <div className="bg-slate-900/50 rounded-[32px] md:rounded-[40px] border border-white/5 p-6 md:p-8 space-y-6 md:space-y-8">
                              <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 md:gap-6">
                                 {[
                                    { label: 'Listing to Close', val: '0.85', color: 'text-blue-400' },
                                    { label: 'Buyer vs Seller', val: '1.20', color: 'text-purple-400' },
                                    { label: 'Avg Deal Size', val: '$850k', color: 'text-emerald-400' }
                                 ].map((stat, i) => (
                                    <div key={i} className="space-y-1">
                                       <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                                       <p className={`text-2xl md:text-3xl font-black ${stat.color}`}>{stat.val}</p>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="bg-white/5 rounded-[32px] md:rounded-[40px] border border-white/10 overflow-hidden">
                           <div className="p-6 md:p-8 border-b border-white/5 flex items-center gap-3">
                              <div className="w-7 h-7 md:w-8 md:h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                                 <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />
                              </div>
                              <div className="h-3 md:h-4 w-32 md:w-40 bg-white/10 rounded" />
                           </div>
                           <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                              {[1, 2, 3].map((_, i) => (
                                 <div key={i} className="flex items-center justify-between py-3 md:py-4 border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-3 md:gap-4">
                                       <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full" />
                                       <div className="h-3 md:h-4 w-24 md:w-32 bg-white/10 rounded" />
                                    </div>
                                    <div className="flex gap-6 md:gap-12">
                                       <div className="h-3 md:h-4 w-16 md:w-24 bg-white/5 rounded" />
                                       <div className="h-3 md:h-4 w-16 md:w-24 bg-blue-500/20 rounded" />
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      <section id="features" className="py-20 md:py-32 px-4 md:px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
          <div className="text-center space-y-4 md:space-y-6 px-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">Engineered for Success</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">The tools you need to push your team further, faster.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group bg-slate-900/30 border border-white/5 p-8 md:p-10 rounded-[32px] md:rounded-[40px] space-y-6 md:space-y-8 hover:border-blue-500/30 hover:bg-slate-900/50 transition-all duration-500"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 ${f.color} rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-black/40`}>
                  <f.icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 md:py-40 px-4 md:px-6 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 pointer-events-none blur-[100px] md:blur-[150px]" />
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 border-none rounded-[40px] md:rounded-[56px] overflow-hidden shadow-2xl shadow-blue-500/20">
            <CardContent className="p-10 md:p-24 text-center space-y-10 md:space-y-12">
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.95] md:leading-[0.9]">
                  Start Winning <br />Today.
                </h2>
                <p className="text-blue-100 text-lg md:text-xl font-medium opacity-80">Simple, transparent pricing for growing teams.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-[32px] md:rounded-[40px] p-8 md:p-10 inline-block border border-white/20 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-left">
                  <div className="space-y-0 text-center md:text-left">
                    <p className="text-6xl md:text-7xl font-black text-white">$1</p>
                    <p className="text-blue-200 font-black uppercase text-[8px] md:text-[10px] tracking-[0.3em]">per month / team</p>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-white/20" />
                  <div className="space-y-2 text-center md:text-left">
                    <p className="text-lg md:text-xl font-black text-white flex items-center justify-center md:justify-start gap-3">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-green-400 rounded-full flex items-center justify-center">
                         <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-900" />
                      </div> 
                      30-Day Free Trial
                    </p>
                    <p className="text-blue-100/70 text-xs md:text-sm font-medium">No Credit Card required to start.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 md:pt-8 space-y-6 md:space-y-8">
                <Button 
                  onClick={() => handleGo()}
                  size="lg" 
                  className="w-full md:w-auto bg-white text-blue-700 hover:bg-blue-50 h-16 md:h-20 px-12 md:px-16 rounded-[20px] md:rounded-[24px] font-black uppercase tracking-widest text-lg md:text-xl shadow-2xl shadow-black/20 group"
                >
                  Claim Your Handle <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
                <p className="text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]">Cancel anytime • Secure setup</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="py-20 md:py-32 border-t border-white/5 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 md:gap-16">
          <div className="space-y-4 md:space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black shadow-2xl">TG</div>
              <span className="font-black text-xl md:text-2xl tracking-tighter uppercase italic text-white">TeamGoals</span>
            </div>
            <p className="text-slate-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">
              © 2026 TeamGoals • Built for High Performance.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
             <a href="mailto:hello@team-goals.com" className="hover:text-white transition-colors">Contact</a>
             <a href="#" className="hover:text-white transition-colors">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
