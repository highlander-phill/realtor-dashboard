"use client";

export const runtime = "edge";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut as nextSignOut } from "next-auth/react";
import { 
  ChevronLeft, 
  Save, 
  LogOut, 
  Plus, 
  Trash2, 
  Settings, 
  RefreshCcw,
  Lock,
  Shield,
  Image as ImageIcon,
  UserMinus,
  UserCheck,
  LayoutGrid,
  Users,
  Eye,
  CalendarClock,
  TrendingUp,
  HelpCircle,
  CreditCard,
  ExternalLink,
  MessageSquare,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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
  subTeamId?: string;
  name: string;
  goal: number;
  volumeClosed: number;
  volumePending: number;
  listingsVolume: number;
  status: string;
  countInTotal: boolean;
  buyers: number;
  sellers: number;
  transactions: Transaction[];
  customFields?: Record<string, any>;
}

interface SubTeam {
  id: string;
  name: string;
  goal: number;
}

interface CustomColumn {
  id: string;
  name: string;
  type: 'number' | 'text' | 'select';
  options?: string[];
}

interface DashboardData {
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    logoUrl?: string;
    primaryColor: string;
    theme?: string;
    darkMode: boolean;
    onboardingCompleted: boolean;
    showTimeToClose: boolean;
    trackDaysToClose: boolean;
    showPriceDelta: boolean;
    hasViewerPassword: boolean;
    billingStatus?: string;
    customColumns?: CustomColumn[];
  };
  team: {
    goal: number;
    ytdProduction: number;
  };
  subTeams: SubTeam[];
  agents: AgentData[];
  lastUpdated: string;
}

const initialData: DashboardData = {
  tenant: {
    id: "",
    name: "Loading...",
    subdomain: "",
    primaryColor: "#000000",
    darkMode: false,
    onboardingCompleted: true,
    showTimeToClose: false,
    trackDaysToClose: false,
    showPriceDelta: false,
    hasViewerPassword: false,
    customColumns: []
  },
  team: {
    goal: 1,
    ytdProduction: 0,
  },
  subTeams: [],
  agents: [],
  lastUpdated: new Date().toISOString(),
};

export default function AdminPanel() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"agents" | "subteams" | "settings" | "billing">("agents");
  
  const [newPassword, setNewPassword] = useState("");
  const [viewerPassword, setViewerPassword] = useState("");

  const [supportOpen, setSupportOpen] = useState(searchParams.get('support') === 'true');
  const [supportMessage, setSupportMessage] = useState("");
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${subdomain}/admin/login`);
    }

    async function fetchData() {
      const response = await fetch(`/api/dashboard?subdomain=${subdomain}`);
      if (response.ok) {
        const cloudData = await response.json();
        if (cloudData.tenant) {
          setData(cloudData);
        }
      }
    }
    if (subdomain && status === "authenticated") fetchData();
  }, [subdomain, router, status]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lastUpdated: new Date().toISOString() }),
      });
      if (response.ok) {
        alert("Changes saved successfully!");
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update_settings',
          tenant: { subdomain },
          name: data.tenant.name,
          primaryColor: data.tenant.primaryColor,
          logoUrl: data.tenant.logoUrl,
          darkMode: data.tenant.darkMode,
          adminPassword: newPassword || undefined,
          viewerPassword: viewerPassword || undefined,
          showTimeToClose: data.tenant.showTimeToClose,
          trackDaysToClose: data.tenant.trackDaysToClose,
          showPriceDelta: data.tenant.showPriceDelta
        }),
      });
      if (response.ok) {
        alert("Branding & Security updated!");
        setNewPassword("");
        setViewerPassword("");
      }
    } catch (err) {
      alert("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const [sortConfig, setSortConfig] = useState<{ key: keyof AgentData, direction: 'asc' | 'desc' } | null>(null);

  const sortedAgents = [...(data?.agents || [])].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aVal = (a as any)[key];
    const bVal = (b as any)[key];
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof AgentData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const addAgent = () => {
    const newAgent: AgentData = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Agent",
      goal: 5000000,
      volumeClosed: 0,
      volumePending: 0,
      listingsVolume: 0,
      buyers: 0,
      sellers: 0,
      status: "active",
      countInTotal: true,
      transactions: []
    };
    setData({ ...data, agents: [...(data.agents || []), newAgent] });
  };

  const addSubTeam = () => {
    const newST: SubTeam = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Team",
      goal: 25000000
    };
    setData({ ...data, subTeams: [...(data.subTeams || []), newST] });
  };

  const updateAgent = (id: string, field: keyof AgentData, value: any) => {
    setData({
      ...data,
      agents: data.agents.map(a => a.id === id ? { ...a, [field]: value } : a)
    });
  };

  const handleLogout = () => {
    nextSignOut({ callbackUrl: `/${subdomain}` });
  };

  const handleUpgrade = async () => {
    setIsSaving(true);
    const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: data.tenant.id, priceId: 'price_1TK7zZ4YkfnFDOD9XtoU6E6m' }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setIsSaving(false);
  };

  const handlePortal = async () => {
    setIsSaving(true);
    const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: data.tenant.id }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setIsSaving(false);
  };

  const handlePayNow = async () => {
    setIsSaving(true);
    const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tenantId: data.tenant.id, 
          priceId: 'price_1TK7zZ4YkfnFDOD9XtoU6E6m',
          skipTrial: true 
        }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setIsSaving(false);
  };

  const handleSendSupport = async () => {
    if (!supportMessage.trim()) return;
    setIsSendingSupport(true);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: session?.user?.name || subdomain,
          userEmail: session?.user?.email || 'unknown@team-goals.com',
          message: supportMessage
        }),
      });
      if (res.ok) {
        alert("Support request sent! We'll get back to you soon.");
        setSupportMessage("");
        setSupportOpen(false);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || errData.message || "Failed to send");
      }
    } catch (e: any) {
      alert(`Error: ${e.message || "Error sending support request. Please try again later."}`);
    } finally {
      setIsSendingSupport(false);
    }
  };

  const HelpIcon = ({ topic }: { topic?: string }) => (
    <Link href={`/${subdomain}/admin/help${topic ? `#${topic}` : ''}`} target="_blank">
       <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500 cursor-help transition-colors inline-block ml-1.5 mb-0.5" />
    </Link>
  );

  if (status === "loading") {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-black uppercase tracking-widest text-slate-500">Authenticating...</div>;
  }

  if (status === "unauthenticated") {
    return null; // Let the useEffect handle redirection
  }

  if (!data || !data.tenant || data.tenant.name === "Loading...") {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-black uppercase tracking-widest text-slate-500">Loading Data...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 dark:bg-black p-8 rounded-[40px] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
             <Link href={`/${subdomain}`}>
               <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
                 <ChevronLeft className="w-5 h-5" />
               </Button>
             </Link>
             <div>
                <h1 className="text-3xl font-black uppercase tracking-tight italic text-white leading-none">Admin Management</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">{data.tenant.name} • Master Controls v2.2.20</p>
             </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link href={`/${subdomain}/admin/help`}>
               <Button variant="outline" className="rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 h-14 px-8 border-2 border-blue-900 text-blue-400 hover:bg-blue-900 transition-all">
                  <HelpCircle className="w-4 h-4" /> Help Center
               </Button>
            </Link>
            <Button onClick={() => setSupportOpen(true)} variant="outline" className="rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 h-14 px-8 border-2 border-slate-700 text-slate-400 hover:bg-slate-800 transition-all">
               <MessageSquare className="w-4 h-4" /> Support
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl gap-2 h-14 px-10 shadow-xl shadow-blue-900/40">
              {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish Updates
            </Button>
            <Button onClick={handleLogout} variant="outline" className="rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 h-14 px-8 border-2 border-slate-700 text-slate-300 hover:bg-slate-800 transition-all">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
           {[
             { id: 'agents', label: 'Roster Management', icon: Users },
             { id: 'subteams', label: 'Team Divisions', icon: LayoutGrid },
             { id: 'settings', label: 'System Settings', icon: Settings },
             { id: 'billing', label: 'Subscription', icon: CreditCard }
           ].map((tab) => (
             <Button 
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"} 
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-full font-black uppercase text-[10px] tracking-widest px-8 gap-2 h-12 transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-900 dark:hover:bg-slate-800 hover:text-white'}`}
             >
               <tab.icon className="w-4 h-4" /> {tab.label}
             </Button>
           ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "agents" && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-[32px] bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-900 dark:bg-black border-b border-slate-800 flex flex-row items-center justify-between py-8 px-10">
                  <div>
                    <CardTitle className="text-xl font-black uppercase italic text-white">Active Roster</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Individual Performance Targets</CardDescription>
                  </div>
                  <Button onClick={addAgent} variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-none font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl h-10 px-4 shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                    <Plus className="w-4 h-4" /> New Agent
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-950">
                      <TableRow className="border-slate-200 dark:border-slate-800">
                        <TableHead onClick={() => handleSort('name')} className="px-10 py-5 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">Agent Name ↕</TableHead>
                        <TableHead onClick={() => handleSort('subTeamId')} className="font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">Sub-Team ↕</TableHead>
                        <TableHead onClick={() => handleSort('goal')} className="font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">Goal ($) ↕ <HelpIcon /></TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Closed <HelpIcon /></TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Pending <HelpIcon /></TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Buyers</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Sellers <HelpIcon /></TableHead>
                        {(data.tenant.customColumns || []).map(col => (
                           <TableHead key={col.id} className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">{col.name}</TableHead>
                        ))}
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Status</TableHead>
                        <TableHead className="text-right px-10 font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAgents.map((agent) => (
                        <TableRow key={agent.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <TableCell className="px-10 py-6">
                            <Input 
                              value={agent.name} 
                              onChange={(e) => updateAgent(agent.id, "name", e.target.value)}
                              className="bg-transparent border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-black h-12 font-black text-lg tracking-tight"
                            />
                          </TableCell>
                          <TableCell>
                             <select 
                              value={agent.subTeamId || ""} 
                              onChange={(e) => updateAgent(agent.id, "subTeamId", e.target.value || undefined)}
                              className="bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg px-3 h-12 font-bold text-xs focus:bg-white dark:focus:bg-black"
                             >
                               <option value="">Company Wide</option>
                               {(data.subTeams || []).map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                             </select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={agent.goal} 
                              onChange={(e) => updateAgent(agent.id, "goal", Number(e.target.value))}
                              className="bg-transparent border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-black h-12 font-mono text-xs font-bold"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={agent.volumeClosed} 
                              onChange={(e) => updateAgent(agent.id, "volumeClosed", Number(e.target.value))}
                              className="bg-transparent border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-black h-12 font-mono text-xs font-bold"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={agent.volumePending} 
                              onChange={(e) => updateAgent(agent.id, "volumePending", Number(e.target.value))}
                              className="bg-transparent border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-black h-12 font-mono text-xs font-bold"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={agent.buyers} 
                              onChange={(e) => updateAgent(agent.id, "buyers", Number(e.target.value))}
                              className="bg-transparent border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-black h-12 font-mono text-xs font-bold"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={agent.sellers} 
                              onChange={(e) => updateAgent(agent.id, "sellers", Number(e.target.value))}
                              className="bg-transparent border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-black h-12 font-mono text-xs font-bold"
                            />
                          </TableCell>
                          {(data.tenant.customColumns || []).map(col => (
                            <TableCell key={col.id}>
                              <Input 
                                type={col.type === 'number' ? 'number' : 'text'}
                                value={agent.customFields?.[col.id] || ""} 
                                onChange={(e) => {
                                  const val = col.type === 'number' ? Number(e.target.value) : e.target.value;
                                  updateAgent(agent.id, "customFields", { ...(agent.customFields || {}), [col.id]: val });
                                }}
                                className="bg-transparent border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-black h-12 font-bold text-xs"
                              />
                            </TableCell>
                          ))}
                          <TableCell>
                             <div className="flex flex-col gap-2">
                                <Badge variant={agent.status === 'active' ? 'default' : 'outline'} className="uppercase text-[9px] w-fit">
                                   {agent.status}
                                </Badge>
                                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">
                                   <input 
                                    type="checkbox" 
                                    checked={agent.countInTotal} 
                                    onChange={(e) => updateAgent(agent.id, "countInTotal", e.target.checked)} 
                                    className="w-3 h-3 rounded border-slate-300"
                                   /> Include Progress
                                </label>
                             </div>
                          </TableCell>
                          <TableCell className="text-right px-10">
                            <div className="flex justify-end gap-2">
                               <Button 
                                onClick={() => updateAgent(agent.id, "status", agent.status === 'active' ? 'expired' : 'active')}
                                variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 rounded-full"
                               >
                                 {agent.status === 'active' ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                               </Button>
                               <Link href={`/${subdomain}/agent/${agent.id}`}>
                                 <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 rounded-full">
                                   <Settings className="w-4 h-4" />
                                 </Button>
                               </Link>
                               <Button onClick={() => {
                                 if(confirm("Permanently remove this agent and all their data?")) setData({ ...data, agents: data.agents.filter(a => a.id !== agent.id) });
                               }} variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 rounded-full">
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "subteams" && (
            <motion.div
              key="subteams"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-[32px] bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between py-8 px-10">
                  <div>
                    <CardTitle className="text-xl font-black uppercase italic">Division Management</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Group Roster into Sub-Teams</CardDescription>
                  </div>
                  <Button onClick={addSubTeam} variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl h-10 px-4">
                    <Plus className="w-4 h-4" /> New Division
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="px-10 py-5 font-black text-[10px] uppercase tracking-widest">Team Name</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Annual Production Goal ($)</TableHead>
                        <TableHead className="text-right px-10 font-black text-[10px] uppercase tracking-widest">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.subTeams?.map((st) => (
                        <TableRow key={st.id} className="border-slate-100 dark:border-slate-800">
                          <TableCell className="px-10 py-6">
                            <Input 
                              value={st.name} 
                              onChange={(e) => setData({...data, subTeams: data.subTeams.map(s => s.id === st.id ? {...s, name: e.target.value} : s)})}
                              className="bg-transparent border-slate-200 dark:border-slate-800 h-12 font-black text-lg tracking-tight"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={st.goal} 
                              onChange={(e) => setData({...data, subTeams: data.subTeams.map(s => s.id === st.id ? {...s, goal: Number(e.target.value)} : s)})}
                              className="bg-transparent border-slate-200 dark:border-slate-800 h-12 font-mono text-xs font-bold"
                            />
                          </TableCell>
                          <TableCell className="text-right px-10">
                             <Button onClick={() => setData({...data, subTeams: data.subTeams.filter(s => s.id !== st.id)})} variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 rounded-full">
                               <Trash2 className="w-4 h-4" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-[32px] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-6 px-8">
                  <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 dark:text-white">
                     <ImageIcon className="w-4 h-4 text-blue-500" /> Branding & UI
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Display Name</Label>
                    <Input 
                      value={data.tenant.name}
                      onChange={(e) => setData({...data, tenant: {...data.tenant, name: e.target.value}})}
                      className="h-14 font-black text-xl italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Primary Color</Label>
                    <div className="flex gap-4">
                      <Input 
                        type="color"
                        value={data.tenant.primaryColor}
                        onChange={(e) => setData({...data, tenant: {...data.tenant, primaryColor: e.target.value}})}
                        className="w-14 h-14 p-1 rounded-2xl border-none shadow-lg"
                      />
                      <Input 
                        value={data.tenant.primaryColor}
                        onChange={(e) => setData({...data, tenant: {...data.tenant, primaryColor: e.target.value}})}
                        className="flex-1 font-mono uppercase font-black text-lg h-14"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Logo Link</Label>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <Input 
                          value={data.tenant.logoUrl || ""}
                          onChange={(e) => setData({...data, tenant: {...data.tenant, logoUrl: e.target.value}})}
                          placeholder="https://..."
                          className="h-14 font-bold flex-1"
                        />
                            <Button 
                              onClick={() => {
                                const cleanColor = (data.tenant.primaryColor || "#000000").trim().replace('#', '');
                                const nameParam = (data.tenant.name || "TG").trim().split(' ').map(n => n[0]).join('').substring(0, 2);
                                const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameParam)}&background=${cleanColor}&color=fff&size=128&bold=true`;
                                setLogoPreview(logoUrl);
                              }}
                              variant="outline" 
                            className="h-14 rounded-2xl bg-black text-white hover:bg-slate-800 border-none font-black uppercase text-[10px] px-4"
                          >
                            Generate
                          </Button>
                      </div>
                      
                      {logoPreview && (
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                          <div className="relative w-16 h-16 bg-slate-200 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                            <img 
                              src={logoPreview} 
                              key={logoPreview}
                              alt="Logo Preview" 
                              className="w-full h-full object-cover" 
                              onLoad={() => console.log("Logo preview loaded")}
                              onError={(e) => {
                                console.error("Logo preview failed to load");
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Error&background=f00&color=fff`;
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Preview Generated</p>
                            <Button 
                              onClick={() => {
                                setData({...data, tenant: {...data.tenant, logoUrl: logoPreview}});
                                setLogoPreview(null);
                                alert("Logo applied to local settings. Click 'Publish Updates' at the top to save it to your live dashboard.");
                              }}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] h-8 px-4 rounded-lg"
                            >
                              Apply Logo
                            </Button>
                          </div>
                          <Button onClick={() => setLogoPreview(null)} variant="ghost" size="sm" className="text-slate-400 hover:text-red-600 font-black uppercase text-[10px]">Cancel</Button>
                        </div>
                      )}

                      {data.tenant.logoUrl && !logoPreview && (
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                           <img src={data.tenant.logoUrl} alt="Current Logo" className="w-12 h-12 rounded-lg object-contain bg-white p-1" />
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Logo</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-4 border-t border-slate-100 dark:border-slate-800">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Transaction Columns</Label>
                    <div className="space-y-3">
                       <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl cursor-pointer" title="Displays the 'Date Listed' column on transaction tables.">
                          <span className="flex items-center gap-3 font-bold text-sm">
                             <CalendarClock className="w-4 h-4 text-blue-500" /> Track 'Date Listed'
                          </span>
                          <input 
                            type="checkbox" 
                            checked={data.tenant.showTimeToClose} 
                            onChange={(e) => setData({...data, tenant: {...data.tenant, showTimeToClose: e.target.checked}})} 
                            className="w-5 h-5 rounded border-slate-300"
                          />
                       </label>
                       <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl cursor-pointer" title="Calculates and displays the number of days between 'Date Listed' and 'Date Closed'.">
                          <span className="flex items-center gap-3 font-bold text-sm">
                             <CalendarClock className="w-4 h-4 text-purple-500" /> Track 'Days to Close'
                          </span>
                          <input 
                            type="checkbox" 
                            checked={data.tenant.trackDaysToClose} 
                            onChange={(e) => setData({...data, tenant: {...data.tenant, trackDaysToClose: e.target.checked}})} 
                            className="w-5 h-5 rounded border-slate-300"
                          />
                       </label>
                       <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl cursor-pointer" title="Shows the difference between the initial List Price and the final Sale Price.">
                          <span className="flex items-center gap-3 font-bold text-sm">
                             <TrendingUp className="w-4 h-4 text-green-500" /> Track List vs Sale Price
                          </span>
                          <input 
                            type="checkbox" 
                            checked={data.tenant.showPriceDelta} 
                            onChange={(e) => setData({...data, tenant: {...data.tenant, showPriceDelta: e.target.checked}})} 
                            className="w-5 h-5 rounded border-slate-300"
                          />
                       </label>
                       <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl cursor-pointer" title="Overrides user preferences and forces the dashboard into high-contrast dark mode.">
                          <span className="flex items-center gap-3 font-bold text-sm">
                             <Lock className="w-4 h-4 text-purple-500" /> Force Dark Mode
                          </span>
                          <input 
                            type="checkbox" 
                            checked={data.tenant.darkMode} 
                            onChange={(e) => setData({...data, tenant: {...data.tenant, darkMode: e.target.checked}})} 
                            className="w-5 h-5 rounded border-slate-300"
                          />
                       </label>
                    </div>
                  </div>

                  <div className="pt-8 space-y-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Custom Columns</Label>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Add unique data points to your roster</p>
                      </div>
                      <Button 
                        onClick={() => {
                          const newCol: CustomColumn = { id: Math.random().toString(36).substr(2, 5), name: 'New Column', type: 'number' };
                          setData({...data, tenant: {...data.tenant, customColumns: [...(data.tenant.customColumns || []), newCol]}});
                        }}
                        variant="outline" size="sm" className="h-8 rounded-lg border-blue-600 text-blue-600 text-[9px] font-black uppercase tracking-widest gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(data.tenant.customColumns || []).map((col) => (
                        <div key={col.id} className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                           <Input 
                             value={col.name}
                             onChange={(e) => {
                               const newCols = data.tenant.customColumns?.map(c => c.id === col.id ? {...c, name: e.target.value} : c);
                               setData({...data, tenant: {...data.tenant, customColumns: newCols}});
                             }}
                             className="h-10 font-bold text-xs"
                             placeholder="Column Name"
                           />
                           <select 
                              value={col.type}
                              onChange={(e) => {
                                const newCols = data.tenant.customColumns?.map(c => c.id === col.id ? {...c, type: e.target.value as any} : c);
                                setData({...data, tenant: {...data.tenant, customColumns: newCols}});
                              }}
                              className="h-10 rounded-lg border border-input bg-transparent px-3 text-xs font-bold focus:ring-1 focus:ring-ring outline-none"
                           >
                             <option value="number">Number</option>
                             <option value="text">Text</option>
                           </select>
                           <Button 
                             onClick={() => {
                               const newCols = data.tenant.customColumns?.filter(c => c.id !== col.id);
                               setData({...data, tenant: {...data.tenant, customColumns: newCols}});
                             }}
                             variant="ghost" size="icon" className="text-slate-400 hover:text-red-600"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-[32px] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-6 px-8">
                  <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 dark:text-white">
                     <Lock className="w-4 h-4 text-red-500" /> Security Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Admin Password</Label>
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">{session?.user?.email}</span>
                      </div>
                      <Input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-14 font-bold"
                      />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Updating this will change the password for the account shown above</p>
                   </div>

                   <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Public Viewer Password</Label>
                      <Input 
                        type="password"
                        value={viewerPassword}
                        onChange={(e) => setViewerPassword(e.target.value)}
                        placeholder="Leave blank for public access"
                        className="h-14 font-bold"
                      />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">If set, users must enter this to see the dashboard</p>
                   </div>

                   <Button onClick={updateSettings} disabled={isSaving} className="w-full h-14 bg-slate-900 dark:bg-white dark:text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl transition-all active:scale-95">
                      Save Branding & Security
                   </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "billing" && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto w-full"
            >
              <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-[40px] bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-900 dark:bg-black border-b border-slate-800 py-10 px-12">
                   <CardTitle className="text-2xl font-black uppercase italic text-white flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-blue-500" /> Billing & Subscription
                   </CardTitle>
                   <CardDescription className="text-slate-400 font-medium">Manage your team's pro access and billing history.</CardDescription>
                </CardHeader>
                <CardContent className="p-12 space-y-10">
                   <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subscription Status</p>
                         <p className="text-xl font-black uppercase italic dark:text-white">
                            {(subdomain === 'nspg' || data?.tenant?.id === 'nspg-group') ? 'Free Forever' : (data?.tenant?.billingStatus || 'Free Plan')}
                         </p>
                      </div>
                      <Badge className={`uppercase px-4 py-1.5 rounded-full font-black ${(data?.tenant?.billingStatus === 'active' || data?.tenant?.billingStatus === 'trialing') ? 'bg-green-500' : 'bg-slate-200 text-slate-600'}`}>
                         {data?.tenant?.billingStatus === 'trialing' ? 'Trialing' : data?.tenant?.billingStatus === 'active' ? 'Active' : 'Unpaid'}
                      </Badge>
                   </div>

                   {!(subdomain === 'nspg' || data?.tenant?.id === 'nspg-group') && (
                      <div className="space-y-6">
                         <div className="bg-blue-600/5 dark:bg-blue-500/5 border border-blue-600/20 dark:border-blue-500/20 p-8 rounded-3xl space-y-4">
                            <h3 className="text-blue-600 dark:text-blue-400 font-black uppercase italic tracking-tight flex items-center gap-2">
                               <TrendingUp className="w-5 h-5" /> Current Usage Model
                            </h3>
                            <div className="flex justify-between items-end">
                               <div className="space-y-1">
                                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Monthly Price:</p>
                                  <p className="text-3xl font-black dark:text-white">$1.00 <span className="text-sm font-medium opacity-50 text-slate-500">per 10 users</span></p>
                               </div>
                               <div className="text-right space-y-1">
                                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Active Agents:</p>
                                  <p className="text-3xl font-black text-blue-600">{data?.agents?.length || 0}</p>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-600" style={{ width: `${((data?.agents?.length || 0) % 10 || 10) * 10}%` }} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                               Next bracket at {Math.ceil(((data?.agents?.length || 0) + 1) / 10) * 10} agents
                            </p>
                         </div>

                         {(data?.tenant?.billingStatus === 'free' || !data?.tenant?.billingStatus) ? (
                            <div className="space-y-6">
                               <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl">
                                  <p className="text-amber-700 dark:text-amber-400 text-xs font-bold leading-relaxed">
                                     Your 30-day free trial starts today. You won't be charged until the trial ends, and you can cancel anytime before then.
                                  </p>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Button onClick={handleUpgrade} disabled={isSaving} className="h-16 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/40 gap-3">
                                      {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                                      Start 30-Day Free Trial
                                  </Button>
                                  <Button onClick={handlePayNow} disabled={isSaving} variant="outline" className="h-16 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest rounded-2xl gap-3">
                                      {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                      Pay Now (Skip Trial)
                                  </Button>
                               </div>
                            </div>
                         ) : (
                            <div className="space-y-4">
                               <Button onClick={handlePortal} disabled={isSaving} variant="outline" className="w-full h-16 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black uppercase tracking-widest gap-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                                  {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
                                  Manage Payment & Invoices
                               </Button>
                               <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                  Cancellations take effect at the end of your current billing cycle.
                               </p>
                            </div>
                         )}
                      </div>
                   )}

                   { (subdomain === 'nspg' || data?.tenant?.id === 'nspg-group') && (
                      <div className="p-10 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px] text-center space-y-4">
                         <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <Shield className="w-8 h-8 text-slate-400" />
                         </div>
                         <h4 className="text-xl font-black uppercase italic text-slate-400 tracking-tight">Billing Exempt</h4>
                         <p className="text-sm text-slate-500 font-medium">This tenant is part of the core infrastructure and is exempt from all subscription charges.</p>
                      </div>
                   )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
          <DialogContent className="rounded-[40px] border-none shadow-2xl p-10 max-w-lg bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-600" /> Contact Support
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Send a message to the TeamGoals engineering team. We typically respond within 24 hours.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account</Label>
                    <p className="text-xs font-bold truncate">{data.tenant.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin</Label>
                    <p className="text-xs font-bold truncate">{session?.user?.email}</p>
                  </div>
               </div>
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">How can we help?</Label>
                 <Textarea 
                   value={supportMessage}
                   onChange={(e) => setSupportMessage(e.target.value)}
                   placeholder="Describe your issue or feature request..."
                   className="min-h-[150px] rounded-2xl border-slate-200 focus:ring-blue-600 bg-slate-50 dark:bg-slate-950 font-medium"
                 />
               </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSendSupport} disabled={isSendingSupport || !supportMessage.trim()} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/40 gap-3">
                {isSendingSupport ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Support Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
