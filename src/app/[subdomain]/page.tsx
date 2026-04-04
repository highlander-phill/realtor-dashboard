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
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Link from "next/link";

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
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        let url = `/api/dashboard?subdomain=${subdomain}&year=${selectedYear}`;
        if (selectedSubTeam) url += `&subTeamId=${selectedSubTeam}`;
        
        const response = await fetch(url);
        if (response.ok) {
          const cloudData = await response.json();
          if (!cloudData.tenant || !cloudData.tenant.onboardingCompleted) {
             router.push(`/${subdomain}/onboarding`);
             return;
          }
          setData(cloudData);
        }
      } catch (err) {
        console.error("API Error:", err);
      }
    }
    if (subdomain) fetchData();
  }, [subdomain, router, selectedYear, selectedSubTeam]);

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
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{labels.listing} to Close</p>
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
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg {labels.sale} Price</p>
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
                      <TableHead className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Agent Name</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">{labels.production}</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">{labels.pending}</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em]">Progress</TableHead>
                      <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-[0.2em]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.agents.filter(a => a.status === 'active' || a.countInTotal).map((agent) => {
                      const agentProgress = Math.round((agent.volumeClosed / agent.goal) * 100); 
                      return (
                        <TableRow 
                          key={agent.id} 
                          className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                          onClick={() => router.push(`/${subdomain}/agent/${agent.id}`)}
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
                          <TableCell className="text-right font-black text-slate-900 dark:text-white text-lg">{formatCurrency(agent.volumeClosed)}</TableCell>
                          <TableCell className="text-right text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(agent.volumePending)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-xs font-black tracking-tighter">{agentProgress}%</span>
                              <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-white dark:border-slate-900 shadow-inner">
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
