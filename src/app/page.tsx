"use client";

export const runtime = "edge";

import { useState } from "react";
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
      title: "Division Support",
      description: "Organize your roster into sub-teams with their own production goals.",
      icon: Layers,
      color: "bg-yellow-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden">
      
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/20 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>TG</div>
            <span className="font-black text-2xl tracking-tighter uppercase italic">Team<span className="text-blue-500">Goals</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Button variant="outline" onClick={() => router.push('/master')} className="border-slate-800 hover:bg-slate-900 text-slate-300 rounded-full px-6 font-black uppercase text-[10px] tracking-widest">
              Master Login
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative pt-48 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 px-4 py-2 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <Activity className="w-3 h-3" /> The Professional Standard
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase italic">
              Performance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">Visualized.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Transform your team's energy into measurable data. The high-performance dashboard for elite sales organizations.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <Card className="bg-slate-900/50 border-white/10 shadow-2xl p-2 rounded-[40px] backdrop-blur-2xl">
              <CardContent className="p-0">
                <form onSubmit={handleGo} className="flex gap-2">
                  <Input 
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    placeholder="Enter team handle (e.g. nspg)"
                    className="h-16 bg-transparent border-none text-white text-xl font-bold focus:ring-0 px-8 placeholder:text-slate-600"
                  />
                  <Button type="submit" className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-[32px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 group">
                    GO <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div className="flex justify-center gap-6 mt-6">
               <p className="text-[10px] uppercase font-black text-slate-600 tracking-[0.3em]">Try it now:</p>
               <button onClick={() => router.push('/nspg')} className="text-[10px] uppercase font-black text-blue-500 tracking-[0.3em] hover:text-blue-400 transition-colors">/nspg</button>
               <button onClick={() => router.push('/demo')} className="text-[10px] uppercase font-black text-purple-500 tracking-[0.3em] hover:text-purple-400 transition-colors">/demo</button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="demo" className="py-24 px-6 overflow-hidden">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
               <h2 className="text-4xl font-black uppercase italic tracking-tight">Experience the Interface</h2>
               <p className="text-slate-500 font-medium">Toggle between real-world performance views.</p>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full -z-10" />
               <motion.div 
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="bg-slate-900/80 border border-white/10 rounded-[48px] p-4 shadow-2xl backdrop-blur-xl"
               >
                  <div className="bg-slate-950 rounded-[40px] overflow-hidden border border-white/5">
                     <div className="h-12 border-b border-white/5 bg-white/5 flex items-center px-6 gap-2">
                        <div className="flex gap-1.5">
                           <div className="w-3 h-3 rounded-full bg-red-500/50" />
                           <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                           <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="mx-auto bg-white/5 px-4 py-1 rounded-full text-[10px] font-bold text-slate-500 tracking-tight flex items-center gap-2">
                           <Lock className="w-2 h-2" /> team-goals.com/nspg
                        </div>
                     </div>
                     <div className="p-4 md:p-12 space-y-10 origin-top">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/20">NS</div>
                              <div className="space-y-1">
                                 <div className="h-7 w-56 bg-white/10 rounded-lg animate-pulse" />
                                 <div className="h-3 w-32 bg-white/5 rounded-md" />
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <div className="h-10 w-24 bg-white/5 rounded-xl border border-white/10" />
                              <div className="h-10 w-32 bg-blue-600/20 rounded-xl border border-blue-500/20" />
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                           <div className="lg:col-span-3 bg-white/5 rounded-[40px] border border-white/10 p-10 space-y-10">
                              <div className="flex justify-between items-end">
                                 <div className="space-y-4">
                                    <div className="h-3 w-32 bg-blue-500/20 rounded-full" />
                                    <div className="text-6xl font-black italic tracking-tighter">$22,450,000</div>
                                 </div>
                                 <div className="text-right space-y-2">
                                    <div className="h-2 w-24 bg-white/10 rounded-full ml-auto" />
                                    <div className="text-4xl font-black text-blue-500">45%</div>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    <span>Production Progress</span>
                                    <span>Goal: $50,000,000</span>
                                 </div>
                                 <div className="h-6 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      whileInView={{ width: '45%' }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                      className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
                                    />
                                 </div>
                              </div>
                           </div>
                           
                           <div className="bg-slate-900/50 rounded-[40px] border border-white/5 p-8 space-y-8">
                              <div className="space-y-6">
                                 {[
                                    { label: 'Listing to Close', val: '0.85', color: 'text-blue-400' },
                                    { label: 'Buyer vs Seller', val: '1.20', color: 'text-purple-400' },
                                    { label: 'Avg Deal Size', val: '$850k', color: 'text-emerald-400' }
                                 ].map((stat, i) => (
                                    <div key={i} className="space-y-1">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                                       <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="bg-white/5 rounded-[40px] border border-white/10 overflow-hidden">
                           <div className="p-8 border-b border-white/5 flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                                 <Users className="w-4 h-4 text-purple-500" />
                              </div>
                              <div className="h-4 w-40 bg-white/10 rounded" />
                           </div>
                           <div className="p-8 space-y-6">
                              {[1, 2, 3].map((_, i) => (
                                 <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-white/10 rounded-full" />
                                       <div className="h-4 w-32 bg-white/10 rounded" />
                                    </div>
                                    <div className="flex gap-12">
                                       <div className="h-4 w-24 bg-white/5 rounded" />
                                       <div className="h-4 w-24 bg-blue-500/20 rounded" />
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

      <section id="features" className="py-32 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic">Engineered for Success</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">The tools you need to push your team further, faster.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group bg-slate-900/30 border border-white/5 p-10 rounded-[40px] space-y-8 hover:border-blue-500/30 hover:bg-slate-900/50 transition-all duration-500"
              >
                <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-black/40`}>
                  <f.icon className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-40 px-6 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 pointer-events-none blur-[150px]" />
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 border-none rounded-[56px] overflow-hidden shadow-2xl shadow-blue-500/20">
            <CardContent className="p-16 md:p-24 text-center space-y-12">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.9]">
                  Start Winning <br />Today.
                </h2>
                <p className="text-blue-100 text-xl font-medium opacity-80">Simple, transparent pricing for growing teams.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-[40px] p-10 inline-block border border-white/20 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-8 text-left">
                  <div className="space-y-0 text-center md:text-left">
                    <p className="text-7xl font-black text-white">$1</p>
                    <p className="text-blue-200 font-black uppercase text-[10px] tracking-[0.3em]">per month / team</p>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-white/20" />
                  <div className="space-y-2">
                    <p className="text-xl font-black text-white flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                         <Check className="w-4 h-4 text-green-900" />
                      </div> 
                      30-Day Free Trial
                    </p>
                    <p className="text-blue-100/70 text-sm font-medium">No Credit Card required to start.</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-8">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 h-20 px-16 rounded-[24px] font-black uppercase tracking-widest text-xl shadow-2xl shadow-black/20 group">
                  Claim Your Handle <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Cancel anytime • Secure setup</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="py-32 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black shadow-2xl">TG</div>
              <span className="font-black text-2xl tracking-tighter uppercase italic">TeamGoals</span>
            </div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
              © 2026 TeamGoals • Built for High Performance.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
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
