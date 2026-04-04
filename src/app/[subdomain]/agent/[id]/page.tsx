"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Trash2 
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
  status: string;
  side: string;
  date: string;
}

interface AgentData {
  id: string;
  name: string;
  goal: number;
  volumeClosed: number;
  volumePending: number;
  listingsVolume: number;
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

export default function AgentDetail() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const id = params.id as string;
  const [data, setData] = useState<DashboardData>(initialData);
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check if user is logged in as admin for this subdomain
    const auth = localStorage.getItem(`tg_auth_${subdomain}`);
    if (auth) setIsAuthorized(true);

    async function fetchData() {
      const response = await fetch(`/api/dashboard?subdomain=${subdomain}`);
      if (response.ok) {
        const cloudData = await response.json();
        setData(cloudData);
      }
    }
    if (subdomain) fetchData();
  }, [subdomain]);

  const agent = data.agents.find(a => a.id === id);

  const handleSave = async (updatedData: DashboardData) => {
    setIsSaving(true);
    try {
      await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedData, lastUpdated: new Date().toISOString() }),
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
      status: "Pending",
      side: "Buyer",
      date: new Date().toISOString().split('T')[0]
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

  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-500">Agent not found.</p>
          <Link href={`/${subdomain}`}>
            <Button variant="outline">Return to Dashboard</Button>
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <Link href={`/${subdomain}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Team Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{agent.name}</h1>
            <p className="text-slate-500 font-medium">Performance Profile • {data.tenant.name}</p>
          </div>
          <div className="flex items-center gap-4">
             {isAuthorized && (
                <Button onClick={() => handleSave(data)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 h-12 px-6">
                  {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </Button>
             )}
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6 px-8">
                <div className="text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
                   <p className="text-2xl font-black text-blue-600">{progress}%</p>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <div className="text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                   <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Active</Badge>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-none shadow-lg shadow-slate-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-green-500" /> Volume Closed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{formatCurrency(agent.volumeClosed)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-lg shadow-slate-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <PieChart className="w-3 h-3 text-blue-500" /> Goal Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{formatCurrency(agent.goal)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-lg shadow-slate-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <Home className="w-3 h-3 text-orange-500" /> Active Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{formatCurrency(agent.listingsVolume)}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl overflow-hidden rounded-3xl">
          <CardHeader className="bg-slate-900 text-white p-8 flex flex-row items-center justify-between">
             <div>
               <CardTitle className="text-xl">Transaction History</CardTitle>
               <CardDescription className="text-slate-400">Underlying data driving agent performance metrics.</CardDescription>
             </div>
             {isAuthorized && (
               <Button onClick={addTransaction} variant="outline" className="text-white border-slate-700 hover:bg-slate-800 gap-2">
                 <Plus className="w-4 h-4" /> Add Property
               </Button>
             )}
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader className="bg-slate-50">
                   <TableRow>
                      <TableHead className="px-8 py-4 font-bold uppercase text-[10px] tracking-widest">Property Address</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest">Price ($)</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest">Side</TableHead>
                      {isAuthorized && <TableHead className="text-right px-8 font-bold uppercase text-[10px] tracking-widest">Action</TableHead>}
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {(agent.transactions || []).map((t) => (
                      <TableRow key={t.id} className="hover:bg-slate-50 transition-colors">
                         <TableCell className="px-8 py-4">
                            {isAuthorized ? (
                              <Input 
                                value={t.address} 
                                onChange={(e) => updateTransaction(t.id, "address", e.target.value)}
                                className="bg-transparent border-slate-200 focus:bg-white h-10 font-bold"
                              />
                            ) : (
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                 </div>
                                 <span className="font-bold text-slate-900">{t.address}</span>
                              </div>
                            )}
                         </TableCell>
                         <TableCell>
                            {isAuthorized ? (
                              <Input 
                                type="number"
                                value={t.price} 
                                onChange={(e) => updateTransaction(t.id, "price", Number(e.target.value))}
                                className="bg-transparent border-slate-200 focus:bg-white h-10 font-mono text-xs font-bold"
                              />
                            ) : (
                              <span className="font-black text-slate-700">{formatCurrency(t.price)}</span>
                            )}
                         </TableCell>
                         <TableCell>
                            {isAuthorized ? (
                              <select 
                                value={t.status}
                                onChange={(e) => updateTransaction(t.id, "status", e.target.value)}
                                className="bg-transparent border-slate-200 rounded-md h-10 px-2 font-bold text-xs focus:bg-white"
                              >
                                <option value="Sold">Sold</option>
                                <option value="Pending">Pending</option>
                                <option value="Active">Active</option>
                                <option value="Withdrawn">Withdrawn</option>
                              </select>
                            ) : (
                              <Badge className={`${t.status === 'Sold' ? 'bg-green-500' : t.status === 'Pending' ? 'bg-blue-500' : 'bg-orange-500'} text-white border-none text-[10px] font-black uppercase`}>
                                 {t.status}
                               </Badge>
                            )}
                         </TableCell>
                         <TableCell>
                            {isAuthorized ? (
                              <select 
                                value={t.side}
                                onChange={(e) => updateTransaction(t.id, "side", e.target.value)}
                                className="bg-transparent border-slate-200 rounded-md h-10 px-2 font-bold text-xs focus:bg-white"
                              >
                                <option value="Buyer">Buyer</option>
                                <option value="Seller">Seller</option>
                                <option value="Dual">Dual</option>
                              </select>
                            ) : (
                              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                 <Tag className="w-3 h-3" /> {t.side} Represented
                              </span>
                            )}
                         </TableCell>
                         {isAuthorized && (
                            <TableCell className="px-8 text-right">
                               <Button onClick={() => removeTransaction(t.id)} variant="ghost" size="icon" className="text-slate-400 hover:text-red-600">
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                            </TableCell>
                         )}
                      </TableRow>
                   ))}
                   {(!agent.transactions || agent.transactions.length === 0) && (
                      <TableRow>
                         <TableCell colSpan={4} className="h-40 text-center text-slate-400 font-medium">No transaction history recorded.</TableCell>
                      </TableRow>
                   )}
                </TableBody>
             </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
