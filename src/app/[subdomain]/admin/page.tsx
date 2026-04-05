"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Image as ImageIcon,
  UserMinus,
  UserCheck,
  LayoutGrid,
  Users,
  Eye,
  CalendarClock,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  transactions: Transaction[];
}

interface SubTeam {
  id: string;
  name: string;
  goal: number;
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
    onboardingCompleted: true,
    showTimeToClose: false,
    showPriceDelta: false,
    hasViewerPassword: false
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
  const subdomain = params.subdomain as string;
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"agents" | "subteams" | "settings">("agents");
  
  const [newPassword, setNewPassword] = useState("");
  const [viewerPassword, setViewerPassword] = useState("");

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
          adminPassword: newPassword || undefined,
          viewerPassword: viewerPassword || undefined,
          showTimeToClose: data.tenant.showTimeToClose,
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
      status: "active",
      countInTotal: true,
      transactions: []
    };
    setData({ ...data, agents: [...data.agents, newAgent] });
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
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
             <Link href={`/${subdomain}`}>
               <Button variant="ghost" size="icon" className="rounded-full">
                 <ChevronLeft className="w-5 h-5" />
               </Button>
             </Link>
             <div>
                <h1 className="text-2xl font-black uppercase tracking-tight italic">Admin Management</h1>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{data.tenant.name} • Master Controls</p>
             </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl gap-2 h-12 px-6">
              {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish Updates
            </Button>
            <Button onClick={handleLogout} variant="outline" className="rounded-xl font-black uppercase tracking-widest text-xs gap-2 h-12 px-6">
              <LogOut className="w-4 h-4" /> Exit
            </Button>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
           {[
             { id: 'agents', label: 'Roster Management', icon: Users },
             { id: 'subteams', label: 'Team Divisions', icon: LayoutGrid },
             { id: 'settings', label: 'System Settings', icon: Settings }
           ].map((tab) => (
             <Button 
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"} 
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-full font-black uppercase text-[10px] tracking-widest px-6 gap-2 h-10 ${activeTab === tab.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
             >
               <tab.icon className="w-3.5 h-3.5" /> {tab.label}
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
                <CardHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between py-8 px-10">
                  <div>
                    <CardTitle className="text-xl font-black uppercase italic">Active Roster</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Individual Performance Targets</CardDescription>
                  </div>
                  <Button onClick={addAgent} variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl h-10 px-4">
                    <Plus className="w-4 h-4" /> New Agent
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead onClick={() => handleSort('name')} className="px-10 py-5 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">Agent Name ↕</TableHead>
                        <TableHead onClick={() => handleSort('subTeamId')} className="font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">Sub-Team ↕</TableHead>
                        <TableHead onClick={() => handleSort('goal')} className="font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">Goal ($) ↕</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                        <TableHead className="text-right px-10 font-black text-[10px] uppercase tracking-widest">Actions</TableHead>
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
                               {data.subTeams.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
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
                <CardHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 py-6 px-8">
                  <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
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
                    <Input 
                      value={data.tenant.logoUrl || ""}
                      onChange={(e) => setData({...data, tenant: {...data.tenant, logoUrl: e.target.value}})}
                      placeholder="https://..."
                      className="h-14 font-bold"
                    />
                  </div>
                  
                  <div className="pt-4 space-y-4 border-t border-slate-100 dark:border-slate-800">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Transaction Columns</Label>
                    <div className="space-y-3">
                       <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl cursor-pointer">
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
                       <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl cursor-pointer">
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
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-[32px] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 py-6 px-8">
                  <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                     <Lock className="w-4 h-4 text-red-500" /> Security Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Admin Password</Label>
                      <Input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-14 font-bold"
                      />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Required for Admin Console access</p>
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
        </AnimatePresence>

      </div>
    </div>
  );
}
