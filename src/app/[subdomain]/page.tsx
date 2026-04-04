"use client";

export const runtime = "edge";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  Target,
  BarChart3,
  PieChart,
  LayoutGrid,
  Calendar,
  Filter,
  Lock,
  ArrowRight,
  Info,
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
import { Input } from "@/components/ui/input";
import Link from "next/link";

function TVHelpModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm" className="bg-slate-900 text-white border-white/10 hover:bg-slate-800 rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 h-9">
         <Tv className="w-3.5 h-3.5" /> Office TV Setup
      </Button>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setOpen(false)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
             />
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="relative bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden"
             >
                <div className="p-8 space-y-6">
                   <div className="flex justify-between items-center">
                      <h2 className="text-xl font-black uppercase italic text-white flex items-center gap-2">
                         <Tv className="w-5 h-5 text-blue-500" /> Office Display Guide
                      </h2>
                      <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white rounded-full">✕</Button>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-2xl space-y-2">
                         <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Option 1: Laptop + HDMI (Recommended)</p>
                         <p className="text-sm text-slate-300 leading-relaxed font-medium">
                            Plug any laptop into your TV via HDMI. For Windows, go to <span className="text-white font-bold">Settings &gt; Power &gt; Screen</span> and set it to "Never" sleep. For Mac, use "Amphetamine" or set Display Sleep to "Never".
                         </p>
                      </div>

                      <div className="bg-white/5 p-4 rounded-2xl space-y-2">
                         <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Option 2: Smart TV / FireStick</p>
                         <p className="text-sm text-slate-300 leading-relaxed font-medium">
                            Open the "Silk Browser" on FireTV or "Internet" on Samsung/LG. Type in your dashboard URL. Use the browser settings to "Keep screen awake" if available.
                         </p>
                      </div>

                      <div className="bg-white/5 p-4 rounded-2xl space-y-2 text-center py-6">
                         <RefreshCcw className="w-6 h-6 text-green-500 mx-auto mb-2 animate-spin-slow" />
                         <p className="text-[10px] font-black text-white uppercase tracking-widest">Auto-Refresh Enabled</p>
                         <p className="text-xs text-slate-500 font-medium italic">Dashboard data refreshes automatically every 60 seconds.</p>
                      </div>
                   </div>

                   <Button onClick={() => setOpen(false)} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl">
                      Got it, Let's Win
                   </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

interface Transaction {
  id: string;
  agentId: string;
  address: string;
  price: number;
  status: string;
  side: string;
  date: string;
}

interface Agent {
  id: string;
  name: string;
  goal: number;
  volumeClosed: number;
  volumePending: number;
  listingsVolume: number;
  status: string;
  countInTotal: boolean;
  bsRatio: string;
  transactions: Transaction[];
}

interface DashboardData {
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    logoUrl?: string;
    primaryColor: string;
    theme?: string;
    onboardingCompleted: boolean;
    showTimeToClose: boolean;
    showPriceDelta: boolean;
    hasViewerPassword: boolean;
  };
  team: {
    goal: number;
    ytdProduction: number;
    ratios: {
      listingToClose: string;
      buyerToSeller: string;
      avgDealSize: string;
    };
  };
  subTeams: any[];
  agents: Agent[];
  lastUpdated: string;
  year: number;
}

const initialData: DashboardData = {
  tenant: {
    id: "",
    name: "Loading...",
    subdomain: "",
    primaryColor: "#000000",
    onboardingCompleted: true,
    showTimeToClose: false,
    showPriceDelta: false,
    hasViewerPassword: false
  },
  team: {
    goal: 1,
    ytdProduction: 0,
    ratios: { listingToClose: "0", buyerToSeller: "0", avgDealSize: "0" }
  },
  subTeams: [],
  agents: [],
  lastUpdated: new Date().toISOString(),
  year: 2026
};

function DashboardContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  const initialYear = parseInt(searchParams.get('year') || '2026');
  const initialSubTeam = searchParams.get('subTeamId') || '';

  const [data, setData] = useState<DashboardData>(initialData);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedSubTeam, setSelectedSubTeam] = useState(initialSubTeam);
  const [viewerPassword, setViewerPassword] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState<any>(null);
  
  const router = useRouter();

  const fetchData = async (pass?: string) => {
    try {
      let url = `/api/dashboard?subdomain=${subdomain}&year=${selectedYear}`;
      if (selectedSubTeam) url += `&subTeamId=${selectedSubTeam}`;
      if (pass) url += `&password=${pass}`;
      else {
        const stored = localStorage.getItem(`tg_view_${subdomain}`);
        if (stored) url += `&password=${stored}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const cloudData = await response.json();
        if (!cloudData.tenant || !cloudData.tenant.onboardingCompleted) {
           router.push(`/${subdomain}/onboarding`);
           return;
        }
        setData(cloudData);
        setIsLocked(false);
        if (pass) localStorage.setItem(`tg_view_${subdomain}`, pass);
      } else if (response.status === 403) {
        const errData = await response.json();
        setIsLocked(true);
        setLockInfo(errData);
      }
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  useEffect(() => {
    if (subdomain) fetchData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [subdomain, selectedYear, selectedSubTeam]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(viewerPassword);
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 shadow-2xl rounded-[32px] overflow-hidden">
           <CardHeader className="text-center pt-12 pb-8">
              {lockInfo?.logoUrl ? (
                <img src={lockInfo.logoUrl} className="h-16 mx-auto mb-4 object-contain" />
              ) : (
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg" style={{ backgroundColor: lockInfo?.primaryColor }}>
                  <Lock className="w-8 h-8" />
                </div>
              )}
              <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tight">{lockInfo?.tenantName || 'Team Dashboard'}</CardTitle>
              <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Protected Dashboard Access</CardDescription>
           </CardHeader>
           <CardContent className="px-10 pb-12">
              <form onSubmit={handleUnlock} className="space-y-4">
                 <Input 
                   type="password"
                   placeholder="Enter Viewer Password"
                   value={viewerPassword}
                   onChange={(e) => setViewerPassword(e.target.value)}
                   className="h-14 bg-slate-950 border-slate-800 text-white text-center font-bold text-xl rounded-2xl focus:ring-blue-600"
                 />
                 <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20">
                   Unlock Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                 </Button>
              </form>
           </CardContent>
        </Card>
      </div>
    );
  }

  const teamPercentage = Math.round((data.team.ytdProduction / data.team.goal) * 100);
  const theme = data.tenant.theme || 'realtor';
  const labels = {
    realtor: { production: "Volume Closed", pending: "Volume Pending", goal: "Annual Production Goal", unit: "Houses", listing: "Listing", sale: "Sale" },
    sales: { production: "Revenue Closed", pending: "Pipeline Value", goal: "Sales Target", unit: "Deals", listing: "Lead", sale: "Deal" },
    insurance: { production: "Premiums Written", pending: "Pending Quotes", goal: "Premium Target", unit: "Policies", listing: "Quote", sale: "Policy" },
    custom: { production: "Total Production", pending: "In Progress", goal: "Annual Target", unit: "Units", listing: "Unit", sale: "Unit" }
  }[theme as keyof typeof labels] || { production: "Volume Closed", pending: "Volume Pending", goal: "Annual Production Goal", unit: "Houses", listing: "Listing", sale: "Sale" };

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
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {data.tenant.logoUrl ? (
              <img src={data.tenant.logoUrl} alt={data.tenant.name} className="w-16 h-16 object-contain rounded-lg" />
            ) : (
              <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-lg" style={{ backgroundColor: data.tenant.primaryColor }}>
                {data.tenant.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase italic">
                {data.tenant.name}
              </h1>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedYear} Performance</span>
                {selectedSubTeam && <span className="flex items-center gap-1 text-blue-600"><Users className="w-3 h-3" /> {data.subTeams.find(s => s.id === selectedSubTeam)?.name}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-transparent text-xs font-bold px-3 py-1 outline-none"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
             </div>
             
             {data.subTeams.length > 0 && (
               <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <select 
                    value={selectedSubTeam} 
                    onChange={(e) => setSelectedSubTeam(e.target.value)}
                    className="bg-transparent text-xs font-bold px-3 py-1 outline-none"
                  >
                    <option value="">All Teams</option>
                    {data.subTeams.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
               </div>
             )}

            <TVHelpModal />

            <Link href={`/${subdomain}/admin`}>
              <Button variant="outline" size="sm" className="bg-white hover:bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-widest border-slate-200 h-9 px-4">
                Admin Console
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-[32px] bg-white dark:bg-slate-900">
            <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
            <CardHeader className="pb-2 pt-8 px-10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-black uppercase italic tracking-tight">{labels.production} Tracker</CardTitle>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900">
                   <TrendingUp className="text-blue-500 w-4 h-4" />
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Live Updates</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-12 px-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{labels.production} YTD</p>
                  <p className="text-5xl font-black text-slate-900 dark:text-slate-50 tracking-tighter">{formatCurrency(data.team.ytdProduction)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{labels.goal}</p>
                  <p className="text-5xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">{formatCurrency(data.team.goal)}</p>
                </div>
                <div className="flex items-end justify-start md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Achieved</p>
                    <p className="text-6xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">{teamPercentage}%</p>
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
                   <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-blue-400">
                      <BarChart3 className="w-4 h-4" /> Efficiency Ratios
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{labels.listing} to Close</p>
                         <Tooltip content={`Percentage of ${labels.listing.toLowerCase()}s that successfully result in a ${labels.sale.toLowerCase()}.`}>
                            <HelpCircle className="w-3 h-3 text-slate-600" />
                         </Tooltip>
                      </div>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-black">{data.team.ratios.listingToClose}</span>
                         <span className="text-[10px] font-bold text-slate-500">Ratio</span>
                      </div>
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Buyer vs Seller</p>
                         <Tooltip content="Ratio of buyer-side representation vs seller-side representation.">
                            <HelpCircle className="w-3 h-3 text-slate-600" />
                         </Tooltip>
                      </div>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-black">{data.team.ratios.buyerToSeller}</span>
                         <span className="text-[10px] font-bold text-slate-500">Ratio</span>
                      </div>
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg {labels.sale} Price</p>
                         <Tooltip content={`The average monetary value of a closed ${labels.sale.toLowerCase()}.`}>
                            <HelpCircle className="w-3 h-3 text-slate-600" />
                         </Tooltip>
                      </div>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-black">{formatCurrency(parseInt(data.team.ratios.avgDealSize))}</span>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden">
            <CardHeader className="px-10 py-8 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                     <Users className="w-5 h-5" />
                  </div>
                  <CardTitle className="font-black uppercase italic">Agent Performance</CardTitle>
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
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">Active Listings (V)</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">
                         <div className="flex items-center justify-end gap-1">
                            B/S Ratio
                            <Tooltip content="Buyer vs Seller representation ratio for this agent.">
                               <HelpCircle className="w-2.5 h-2.5" />
                            </Tooltip>
                         </div>
                      </TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">Progress %</TableHead>
                      <TableHead className="text-right pr-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.agents.filter(a => a.status === 'active' || a.countInTotal).map((agent) => {
                      const agentProgress = Math.round((agent.volumeClosed / agent.goal) * 100); 
                      return (
                        <TableRow 
                          key={agent.id} 
                          className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                          onClick={() => router.push(`/${subdomain}/agent/${agent.id}?year=${selectedYear}`)}
                        >
                          <TableCell className="px-10 py-6">
                             <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight">
                                  {agent.name} 
                                  {agent.status === 'expired' && <span className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-black">EXPIRED</span>}
                                </span>
                             </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-500">{formatCurrency(agent.goal)}</TableCell>
                          <TableCell className="text-right font-black text-slate-900 dark:text-white text-lg">{formatCurrency(agent.volumeClosed)}</TableCell>
                          <TableCell className="text-right text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(agent.volumePending)}</TableCell>
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
                             <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600">
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
        </motion.div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Performance Data...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
