"use client";

export const runtime = "edge";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ChevronRight,
  Target,
  BarChart3,
  Calendar,
  Lock,
  ArrowRight,
  HelpCircle,
  Tv,
  RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Link from "next/link";

function Tooltip({ children, content }: { children: React.ReactNode, content: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-2xl z-50 border border-white/10 text-center leading-relaxed"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DemoContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const router = useRouter();

  useEffect(() => {
    async function fetchDemo() {
      const res = await fetch(`/api/demo?year=${selectedYear}`);
      if (res.ok) {
        setData(await res.json());
      }
    }
    fetchDemo();
  }, [selectedYear]);

  if (!data) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black uppercase tracking-widest italic">Initializing Demo...</div>;

  const teamPercentage = Math.round((data.team.ytdProduction / data.team.goal) * 100);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center justify-between shadow-xl shadow-purple-900/20">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-black">!</div>
              <p className="text-xs font-black uppercase tracking-widest italic">You are in Demo Mode (Read-Only)</p>
           </div>
           <Link href="/">
              <Button size="sm" className="bg-white text-purple-600 hover:bg-purple-50 font-black uppercase text-[10px] tracking-widest rounded-xl h-8 px-4">
                 Get Your Own Dashboard
              </Button>
           </Link>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-lg">
                DT
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase italic">
                  {data.tenant.name}
                </h1>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedYear} Performance</span>
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-black italic">DEMO ENVIRONMENT</span>
                </div>
              </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-transparent text-xs font-bold px-3 py-1 outline-none"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
             </div>
             <Button variant="outline" className="bg-white hover:bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-widest border-slate-200 h-9 px-4 cursor-not-allowed opacity-50">
                Admin Console (Locked)
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-[32px] bg-white dark:bg-slate-900">
            <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
            <CardHeader className="pb-2 pt-8 px-10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-black uppercase italic tracking-tight">Production Tracker</CardTitle>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
                   <TrendingUp className="text-indigo-500 w-4 h-4" />
                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Live Updates</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-12 px-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Volume Closed YTD</p>
                  <p className="text-5xl font-black text-slate-900 dark:text-slate-50 tracking-tighter">{formatCurrency(data.team.ytdProduction)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Annual Production Goal</p>
                  <p className="text-5xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">{formatCurrency(data.team.goal)}</p>
                </div>
                <div className="flex items-end justify-start md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Achieved</p>
                    <p className="text-6xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{teamPercentage}%</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                   <span>Performance Progress</span>
                   <span>Goal: {formatCurrency(data.team.goal)}</span>
                </div>
                <Progress value={teamPercentage} className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-900 shadow-inner" />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
             <Card className="bg-slate-900 text-white border-none rounded-[32px] overflow-hidden shadow-2xl">
                <CardHeader className="pb-2 border-b border-white/5">
                   <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-indigo-400">
                      <BarChart3 className="w-4 h-4" /> Efficiency Ratios
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Listing to Close</p>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-black">{data.team.ratios.listingToClose}</span>
                         <span className="text-[10px] font-bold text-slate-500">Ratio</span>
                      </div>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Buyer vs Seller</p>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-black">{data.team.ratios.buyerToSeller}</span>
                         <span className="text-[10px] font-bold text-slate-500">Ratio</span>
                      </div>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Sale Price</p>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-black">{formatCurrency(parseInt(data.team.ratios.avgDealSize))}</span>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden">
          <CardHeader className="px-10 py-8 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                   <Users className="w-5 h-5" />
                </div>
                <CardTitle className="font-black uppercase italic">Demo Roster</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Name of Agent</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">Annual Goal</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">Volume Closed</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">Volume Pending</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">Active Listings</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">B/S Ratio</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">Progress %</TableHead>
                    <TableHead className="text-right pr-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.agents.map((agent: any) => {
                    const agentProgress = Math.round((agent.volumeClosed / agent.goal) * 100); 
                    return (
                      <TableRow 
                        key={agent.id} 
                        className="border-slate-50 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                      >
                        <TableCell className="px-10 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight">
                                {agent.name} 
                              </span>
                           </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-500">{formatCurrency(agent.goal)}</TableCell>
                        <TableCell className="text-right font-black text-slate-900 dark:text-white text-lg">{formatCurrency(agent.volumeClosed)}</TableCell>
                        <TableCell className="text-right text-indigo-600 dark:text-indigo-400 font-bold">{formatCurrency(agent.volumePending)}</TableCell>
                        <TableCell className="text-right text-orange-600 font-bold">{formatCurrency(agent.listingsVolume)}</TableCell>
                        <TableCell className="text-right">
                           <Badge variant="outline" className="font-black border-slate-200 dark:border-slate-800">{agent.bsRatio}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs font-black tracking-tighter">{agentProgress}%</span>
                            <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden shadow-inner">
                              <div 
                                className="bg-green-500 h-full transition-all duration-1000" 
                                style={{ width: `${Math.min(agentProgress, 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-10">
                           <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 hover:text-indigo-600 cursor-not-allowed">
                              <ChevronRight className="w-5 h-5" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Demo...</div>}>
      <DemoContent />
    </Suspense>
  );
}
