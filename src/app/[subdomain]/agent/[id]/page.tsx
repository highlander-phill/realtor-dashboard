"use client";

export const runtime = "edge";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeft, 
  Save, 
  RefreshCcw, 
  DollarSign, 
  PieChart, 
  Home, 
  Plus, 
  MapPin, 
  Tag, 
  Trash2,
  Calendar,
  Clock,
  TrendingUp
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Transaction {
  id: string;
  agentId: string;
  address: string;
  price: number;
  listPrice?: number;
  dateListed?: string;
  status: string;
  side: string;
  date: string;
  year?: number;
}

interface AgentData {
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
    showTimeToClose: boolean;
    showPriceDelta: boolean;
  };
  team: {
    goal: number;
    ytdProduction: number;
  };
  agents: AgentData[];
  lastUpdated: string;
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
  },
  agents: [],
  lastUpdated: new Date().toISOString(),
};

function AgentDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  const id = params.id as string;
  const initialYear = parseInt(searchParams.get('year') || '2026');

  const [data, setData] = useState<DashboardData>(initialData);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = typeof window !== 'undefined' ? localStorage.getItem(`tg_auth_${subdomain}`) : null;
    if (auth) setIsAuthorized(true);

    async function fetchData() {
      if (!subdomain) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/dashboard?subdomain=${subdomain}&year=${selectedYear}`);
        if (response.ok) {
          const cloudData = await response.json();
          setData(cloudData);
        }
      } catch (err) {
        console.error("Agent fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [subdomain, selectedYear]);

  // FLEXIBLE LOOKUP: Match by ID (exact) or Name (slugified)
  const agent = data.agents.find(a => {
    const slug = String(a.name).toLowerCase().trim().replace(/\s+/g, '-');
    const paramId = decodeURIComponent(String(id)).toLowerCase().trim();
    console.log('AGENT_DEBUG: Comparing agent:', { 
      name: a.name, 
      slug, 
      paramId, 
      id: a.id,
      match: String(a.id) === paramId || slug === paramId 
    });
    return String(a.id) === paramId || slug === paramId;
  });

  const handleSave = async (updatedData: DashboardData) => {
    setIsSaving(true);
    try {
      await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedData, year: selectedYear, lastUpdated: new Date().toISOString() }),
      });
      setData(updatedData);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const addTransaction = () => {
    if (!agent) return;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      agentId: agent.id,
      address: "New Property",
      price: 0,
      listPrice: 0,
      dateListed: new Date().toISOString().split('T')[0],
      status: "Pending",
      side: "Buyer",
      date: new Date().toISOString().split('T')[0],
      year: selectedYear
    };
    const updatedAgents = data.agents.map(a => 
      a.id === agent.id ? { ...a, transactions: [...(a.transactions || []), newTx] } : a
    );
    handleSave({ ...data, agents: updatedAgents });
  };

  const removeTransaction = (txId: string) => {
    if (!agent) return;
    const updatedAgents = data.agents.map(a => 
      a.id === agent.id ? { ...a, transactions: (a.transactions || []).filter(t => t.id !== txId) } : a
    );
    handleSave({ ...data, agents: updatedAgents });
  };

  const updateTransaction = (txId: string, field: string, value: any) => {
    if (!agent) return;
    const updatedAgents = data.agents.map(a => 
      a.id === agent.id ? { 
        ...a, 
        transactions: (a.transactions || []).map(t => t.id === txId ? { ...t, [field]: value } : t) 
      } : a
    );
    setData({ ...data, agents: updatedAgents });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
           <RefreshCcw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
           <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Syncing Performance Data...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[32px] space-y-4">
             <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-xl italic shadow-lg shadow-red-900/20">?</div>
             <h2 className="text-xl font-black uppercase italic tracking-tight">Agent Not Found</h2>
             <p className="text-slate-500 text-sm font-medium">The agent "{id}" could not be located in the {subdomain} roster.</p>
          </div>
          <Link href={`/${subdomain}`}>
            <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 text-white font-black uppercase tracking-widest">
               <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const progress = Math.round((agent.volumeClosed / agent.goal) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <Link href={`/${subdomain}`} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors gap-1 uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </Link>

          <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent text-xs font-black px-3 py-1 outline-none uppercase tracking-tighter"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">{agent.name}</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">{data.tenant.name} • {selectedYear} Profile</p>
          </div>
          <div className="flex items-center gap-4">
             {isAuthorized && (
                <Button onClick={() => handleSave(data)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl gap-2 h-12 px-6 shadow-lg shadow-blue-900/20">
                  {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </Button>
             )}
             <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-6 px-8">
                <div className="text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
                   <p className="text-2xl font-black text-blue-600">{progress}%</p>
                </div>
                <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
                <div className="text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                   <Badge className={`${agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'} dark:bg-slate-800 border-none font-black uppercase text-[10px]`}>{agent.status}</Badge>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Card className="bg-white dark:bg-slate-900 border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-[0.2em]">
                <DollarSign className="w-3 h-3 text-green-500" /> Volume Closed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black dark:text-white">{formatCurrency(agent.volumeClosed)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-[0.2em]">
                <PieChart className="w-3 h-3 text-blue-500" /> Annual Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black dark:text-white">{formatCurrency(agent.goal)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-[0.2em]">
                <Home className="w-3 h-3 text-orange-500" /> Active Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black dark:text-white">{formatCurrency(agent.listingsVolume)}</p>
            </CardContent>
          </Card>
          
          {data.tenant.showTimeToClose && (
            <Card className="bg-white dark:bg-slate-900 border-none shadow-xl">
               <CardHeader className="pb-2">
                 <CardTitle className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-[0.2em]">
                   <Clock className="w-3 h-3 text-purple-500" /> Avg Days to Close
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-3xl font-black dark:text-white">
                   {(() => {
                      const closed = agent.transactions.filter(t => t.status === 'Sold' && t.dateListed && t.date);
                      if (closed.length === 0) return "—";
                      const totalDays = closed.reduce((acc, t) => {
                        const start = new Date(t.dateListed!).getTime();
                        const end = new Date(t.date).getTime();
                        return acc + Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
                      }, 0);
                      return Math.round(totalDays / closed.length);
                   })()}
                 </p>
               </CardContent>
            </Card>
          )}

          {data.tenant.showPriceDelta && (
            <Card className="bg-white dark:bg-slate-900 border-none shadow-xl">
               <CardHeader className="pb-2">
                 <CardTitle className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-[0.2em]">
                   <TrendingUp className="w-3 h-3 text-emerald-500" /> List vs Sale %
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-3xl font-black dark:text-white">
                   {(() => {
                      const sold = agent.transactions.filter(t => t.status === 'Sold' && t.listPrice && t.price);
                      if (sold.length === 0) return "—";
                      const totalDelta = sold.reduce((acc, t) => acc + (t.price / t.listPrice!), 0);
                      return (totalDelta / sold.length * 100).toFixed(1) + "%";
                   })()}
                 </p>
               </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-none shadow-2xl overflow-hidden rounded-[32px] bg-white dark:bg-slate-900">
          <CardHeader className="bg-slate-950 text-white p-10 flex flex-row items-center justify-between">
             <div className="space-y-1">
               <CardTitle className="text-2xl font-black uppercase italic tracking-tight">Transaction History</CardTitle>
               <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Historical Performance Log</CardDescription>
             </div>
             {isAuthorized && (
               <Button onClick={addTransaction} variant="outline" className="text-white border-slate-700 hover:bg-slate-800 gap-2 font-bold rounded-xl px-6 h-12">
                 <Plus className="w-4 h-4" /> Add Property
               </Button>
             )}
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                   <TableRow className="border-slate-100 dark:border-slate-800">
                      <TableHead className="px-10 py-5 font-black uppercase text-[10px] tracking-widest">Property Address</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Price ($)</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Closing/Activity</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Side</TableHead>
                      {isAuthorized && <TableHead className="text-right px-10 font-black uppercase text-[10px] tracking-widest">Action</TableHead>}
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {(agent.transactions || []).map((t) => {
                      return (
                      <TableRow key={t.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                         <TableCell className="px-10 py-6 font-bold">{t.address}</TableCell>
                         <TableCell className="font-black">{formatCurrency(t.price)}</TableCell>
                         <TableCell>
                            <Badge className={`${t.status === 'Sold' ? 'bg-green-500' : t.status === 'Pending' ? 'bg-blue-500' : 'bg-orange-500'} text-white border-none text-[10px] font-black uppercase tracking-tighter`}>
                               {t.status}
                             </Badge>
                         </TableCell>
                         <TableCell className="text-xs font-bold text-slate-500">{t.date}</TableCell>
                         <TableCell className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.side} Rep</TableCell>
                         {isAuthorized && (
                            <TableCell className="px-10 text-right">
                               <Button onClick={() => removeTransaction(t.id)} variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 rounded-full">
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                            </TableCell>
                         )}
                      </TableRow>
                   )})}
                </TableBody>
             </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default function AgentDetail() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Profile...</div>}>
      <AgentDetailContent />
    </Suspense>
  );
}
