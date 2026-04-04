"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Users
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
  listings?: number;
  buyers?: number;
  sellers?: number;
  closings?: number;
  mlsLink?: string;
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

  useEffect(() => {
    const auth = localStorage.getItem(`tg_auth_${subdomain}`);
    if (!auth) {
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
    if (subdomain) fetchData();
  }, [subdomain, router]);

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
          adminPassword: newPassword || undefined
        }),
      });
      if (response.ok) {
        alert("Settings updated successfully!");
        setNewPassword("");
      }
    } catch (err) {
      alert("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const addAgent = () => {
    const newAgent: AgentData = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Agent",
      goal: 10000000,
      volumeClosed: 0,
      volumePending: 0,
      listings: 0,
      listingsVolume: 0,
      buyers: 0,
      sellers: 0,
      status: 'active',
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
    localStorage.removeItem(`tg_auth_${subdomain}`);
    router.push(`/${subdomain}`);
  };

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
                <h1 className="text-2xl font-black uppercase tracking-tight">Admin Management</h1>
                <p className="text-slate-500 text-sm font-medium">{data.tenant.name} • Dashboard Controls</p>
             </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2">
              {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish Updates
            </Button>
            <Button onClick={handleLogout} variant="outline" className="rounded-xl font-bold gap-2">
              <LogOut className="w-4 h-4" /> Exit
            </Button>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-2">
           {[
             { id: 'agents', label: 'Roster', icon: Users },
             { id: 'subteams', label: 'Sub-Teams', icon: LayoutGrid },
             { id: 'settings', label: 'Branding & Security', icon: Settings }
           ].map((tab) => (
             <Button 
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"} 
              onClick={() => setActiveTab(tab.id as any)}
              className="rounded-full font-black uppercase text-[10px] tracking-widest px-6 gap-2"
             >
               <tab.icon className="w-3 h-3" /> {tab.label}
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
              <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-3xl">
                <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between py-6 px-8">
                  <div>
                    <CardTitle className="text-lg font-bold uppercase">Active Roster</CardTitle>
                    <CardDescription>Manage individual agent goals and team assignments.</CardDescription>
                  </div>
                  <Button onClick={addAgent} variant="outline" className="bg-white border-slate-200 font-bold gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> New Agent
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="px-8 py-4 font-black text-[10px] uppercase tracking-widest">Agent Name</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Sub-Team</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Goal ($)</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                        <TableHead className="text-right px-8 font-black text-[10px] uppercase tracking-widest">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.agents.map((agent) => (
                        <TableRow key={agent.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <TableCell className="px-8 py-4">
                            <Input 
                              value={agent.name} 
                              onChange={(e) => updateAgent(agent.id, "name", e.target.value)}
                              className="bg-transparent border-slate-200 focus:bg-white h-10 font-bold"
                            />
                          </TableCell>
                          <TableCell>
                             <select 
                              value={agent.subTeamId || ""} 
                              onChange={(e) => updateAgent(agent.id, "subTeamId", e.target.value || undefined)}
                              className="bg-transparent border border-slate-200 rounded px-2 h-10 font-bold text-xs"
                             >
                               <option value="">No Team</option>
                               {data.subTeams.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                             </select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={agent.goal} 
                              onChange={(e) => updateAgent(agent.id, "goal", Number(e.target.value))}
                              className="bg-transparent border-slate-200 focus:bg-white h-10 font-mono text-xs font-bold"
                            />
                          </TableCell>
                          <TableCell>
                             <div className="flex items-center gap-2">
                                <Badge variant={agent.status === 'active' ? 'default' : 'outline'} className="uppercase text-[9px]">
                                   {agent.status}
                                </Badge>
                                <label className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                   <input 
                                    type="checkbox" 
                                    checked={agent.countInTotal} 
                                    onChange={(e) => updateAgent(agent.id, "countInTotal", e.target.checked)} 
                                   /> Count Progress
                                </label>
                             </div>
                          </TableCell>
                          <TableCell className="text-right px-8">
                            <div className="flex justify-end gap-2">
                               <Button 
                                onClick={() => updateAgent(agent.id, "status", agent.status === 'active' ? 'expired' : 'active')}
                                variant="ghost" size="icon" className="text-slate-400"
                               >
                                 {agent.status === 'active' ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                               </Button>
                               <Link href={`/${subdomain}/agent/${agent.id}`}>
                                 <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                                   <Settings className="w-4 h-4" />
                                 </Button>
                               </Link>
                               <Button onClick={() => {
                                 if(confirm("Remove agent entirely?")) setData({ ...data, agents: data.agents.filter(a => a.id !== agent.id) });
                               }} variant="ghost" size="icon" className="text-slate-400 hover:text-red-600">
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
              <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-3xl">
                <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between py-6 px-8">
                  <div>
                    <CardTitle className="text-lg font-bold uppercase italic">Sub-Teams</CardTitle>
                    <CardDescription>Divide your roster into groups with their own production goals.</CardDescription>
                  </div>
                  <Button onClick={addSubTeam} variant="outline" className="bg-white border-slate-200 font-bold gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Sub-Team
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="px-8 py-4 font-black text-[10px] uppercase tracking-widest">Team Name</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Annual Goal ($)</TableHead>
                        <TableHead className="text-right px-8 font-black text-[10px] uppercase tracking-widest">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.subTeams?.map((st) => (
                        <TableRow key={st.id} className="border-slate-100 dark:border-slate-800">
                          <TableCell className="px-8 py-4">
                            <Input 
                              value={st.name} 
                              onChange={(e) => setData({...data, subTeams: data.subTeams.map(s => s.id === st.id ? {...s, name: e.target.value} : s)})}
                              className="bg-transparent border-slate-200 h-10 font-bold"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={st.goal} 
                              onChange={(e) => setData({...data, subTeams: data.subTeams.map(s => s.id === st.id ? {...s, goal: Number(e.target.value)} : s)})}
                              className="bg-transparent border-slate-200 h-10 font-mono text-xs font-bold"
                            />
                          </TableCell>
                          <TableCell className="text-right px-8">
                             <Button onClick={() => setData({...data, subTeams: data.subTeams.filter(s => s.id !== st.id)})} variant="ghost" size="icon" className="text-slate-400 hover:text-red-600">
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
              <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                     <ImageIcon className="w-4 h-4" /> Visual Identity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Display Name</Label>
                    <Input 
                      value={data.tenant.name}
                      onChange={(e) => setData({...data, tenant: {...data.tenant, name: e.target.value}})}
                      className="h-12 font-bold text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand Color</Label>
                    <div className="flex gap-4">
                      <Input 
                        type="color"
                        value={data.tenant.primaryColor}
                        onChange={(e) => setData({...data, tenant: {...data.tenant, primaryColor: e.target.value}})}
                        className="w-12 h-12 p-1 rounded-lg border-none"
                      />
                      <Input 
                        value={data.tenant.primaryColor}
                        onChange={(e) => setData({...data, tenant: {...data.tenant, primaryColor: e.target.value}})}
                        className="flex-1 font-mono uppercase font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Logo URL</Label>
                    <Input 
                      value={data.tenant.logoUrl || ""}
                      onChange={(e) => setData({...data, tenant: {...data.tenant, logoUrl: e.target.value}})}
                      placeholder="https://example.com/logo.png"
                      className="h-12 font-medium"
                    />
                    <p className="text-[10px] text-slate-500">Provide a direct link to your PNG/SVG logo.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                     <Lock className="w-4 h-4" /> Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Change Admin Password</Label>
                      <Input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new management password"
                        className="h-12"
                      />
                      <p className="text-[10px] text-slate-500 italic">Leave blank to keep your current password.</p>
                   </div>
                   <Button onClick={updateSettings} disabled={isSaving} className="w-full h-12 bg-slate-900 dark:bg-white dark:text-slate-900 font-black uppercase tracking-widest text-xs rounded-xl">
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
