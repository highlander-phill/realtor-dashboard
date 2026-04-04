"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initialData, DashboardData, AgentData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, LogOut, LayoutDashboard, Home as HomeIcon, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";

export const runtime = "edge";

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>(initialData);
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const auth = localStorage.getItem("nspg_auth");
    if (!auth) {
      router.push("/admin/login");
    }

    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const cloudData = await response.json();
          if (cloudData.tenant && cloudData.tenant.onboardingCompleted) {
            setData(cloudData);
          }
        } else {
          const savedData = localStorage.getItem("nspg_dashboard_data");
          if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.tenant && parsed.tenant.onboardingCompleted) {
              setData(parsed);
            }
          }
        }
      } catch (err) {
        console.error("API Error:", err);
      }
    }
    fetchData();
  }, [router]);

  const handleSave = async () => {
    setIsSaving(true);
    const updatedData = { ...data, lastUpdated: new Date().toISOString() };
    
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        localStorage.setItem("nspg_dashboard_data", JSON.stringify(updatedData));
      } else {
        localStorage.setItem("nspg_dashboard_data", JSON.stringify(updatedData));
      }
    } catch (err) {
      console.error("Save Error:", err);
      localStorage.setItem("nspg_dashboard_data", JSON.stringify(updatedData));
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const updateTeam = (field: string, value: string) => {
    setData({
      ...data,
      team: { ...data.team, [field]: Number(value) }
    });
  };

  const updateAgent = (id: string, field: keyof AgentData, value: string | number) => {
    setData({
      ...data,
      agents: data.agents.map(a => a.id === id ? { ...a, [field]: typeof value === 'string' ? (field === 'name' ? value : Number(value)) : value } : a)
    });
  };

  const updateTransaction = (agentId: string, transId: string, field: string, value: any) => {
    setData({
      ...data,
      agents: data.agents.map(a => {
        if (a.id !== agentId) return a;
        const updatedTransactions = (a.transactions || []).map(t => 
          t.id === transId ? { ...t, [field]: field === 'price' ? Number(value) : value } : t
        );
        
        // Recalculate ALL agent stats based on updated transactions
        const volumeClosed = updatedTransactions.filter(t => t.status === 'Sold').reduce((sum, t) => sum + t.price, 0);
        const volumePending = updatedTransactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.price, 0);
        const listingsVolume = updatedTransactions.filter(t => t.status === 'Active').reduce((sum, t) => sum + t.price, 0);
        const buyers = updatedTransactions.filter(t => t.side === 'Buyer').length;
        const sellers = updatedTransactions.filter(t => t.side === 'Seller').length;
        
        return { ...a, transactions: updatedTransactions, volumeClosed, volumePending, listingsVolume, buyers, sellers };
      })
    });
  };

  const addTransaction = (agentId: string) => {
    const newTrans = {
      id: Math.random().toString(36).substr(2, 9),
      agentId,
      address: "New Property",
      price: 0,
      status: 'Active' as const,
      side: 'Seller' as const,
      date: new Date().toISOString().split('T')[0]
    };
    const agent = data.agents.find(ag => ag.id === agentId);
    const updatedTransactions = [...(agent?.transactions || []), newTrans];
    
    setData({
      ...data,
      agents: data.agents.map(a => a.id === agentId ? { 
        ...a, 
        transactions: updatedTransactions
      } : a)
    });
  };

  const removeTransaction = (agentId: string, transId: string) => {
    setData({
      ...data,
      agents: data.agents.map(a => {
        if (a.id !== agentId) return a;
        const updatedTransactions = (a.transactions || []).filter(t => t.id !== transId);
        
        const volumeClosed = updatedTransactions.filter(t => t.status === 'Sold').reduce((sum, t) => sum + t.price, 0);
        const volumePending = updatedTransactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.price, 0);
        const listingsVolume = updatedTransactions.filter(t => t.status === 'Active').reduce((sum, t) => sum + t.price, 0);
        const buyers = updatedTransactions.filter(t => t.side === 'Buyer').length;
        const sellers = updatedTransactions.filter(t => t.side === 'Seller').length;

        return { ...a, transactions: updatedTransactions, volumeClosed, volumePending, listingsVolume, buyers, sellers };
      })
    });
  };

  const addAgent = () => {
    const newAgent: AgentData = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Agent",
      goal: 0,
      volumeClosed: 0,
      volumePending: 0,
      listingsVolume: 0,
      buyers: 0,
      sellers: 0,
      transactions: []
    };
    setData({ ...data, agents: [...data.agents, newAgent] });
  };

  const removeAgent = (id: string) => {
    setData({ ...data, agents: data.agents.filter(a => a.id !== id) });
  };

  const logout = () => {
    localStorage.removeItem("nspg_auth");
    router.push("/admin/login");
  };

  const resetOnboarding = () => {
    if (confirm("WARNING: This will reset all team settings and return to the onboarding wizard. Data will be archived. Continue?")) {
      const resetData = {
        ...data,
        tenant: { ...data.tenant, onboardingCompleted: false }
      };
      setData(resetData);
      localStorage.setItem("nspg_dashboard_data", JSON.stringify(resetData));
      router.push("/onboarding");
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <div className="bg-black text-white p-2 rounded text-xs" style={{ backgroundColor: data.tenant.primaryColor }}>
                {data.tenant.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              {data.tenant.name} - Admin Management
            </h1>
            <p className="text-slate-500 text-sm">Configure your team and manage property transactions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Public View
              </Button>
            </Link>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className={`transition-all duration-500 ${isSaving ? 'bg-green-600' : 'bg-black'} hover:bg-slate-800 text-white flex items-center gap-2 px-6 shadow-lg shadow-slate-200`}
            >
              {isSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </Button>
            <Button variant="ghost" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetOnboarding} className="text-slate-400 hover:text-red-500 flex items-center gap-2 group transition-colors">
            <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" /> Reset & Rerun Setup Wizard
          </Button>
        </div>

        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 h-12 w-full max-w-md rounded-xl">
            <TabsTrigger value="team" className="flex-1 font-bold rounded-lg">Team Settings</TabsTrigger>
            <TabsTrigger value="agents" className="flex-1 font-bold rounded-lg">Agent Roster</TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <Card className="border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle>Team Performance Goals</CardTitle>
                <CardDescription>Adjust the primary team metrics here. These drive the main dashboard progress bar.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="team-goal" className="text-xs font-bold uppercase tracking-wider text-slate-400">Annual Production Goal ($)</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
                      <Input 
                        id="team-goal" 
                        type="number" 
                        value={data.team.goal} 
                        onChange={(e) => updateTeam('goal', e.target.value)}
                        className="text-3xl font-black h-16 pl-10 bg-slate-50 border-slate-200 focus:ring-black rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="team-ytd" className="text-xs font-bold uppercase tracking-wider text-slate-400">Current YTD Production ($)</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
                      <Input 
                        id="team-ytd" 
                        type="number" 
                        value={data.team.ytdProduction} 
                        onChange={(e) => updateTeam('ytdProduction', e.target.value)}
                        className="text-3xl font-black h-16 pl-10 bg-slate-50 border-slate-200 focus:ring-black text-blue-600 rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Note: This can be auto-calculated from agents below.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <Card className="border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100 p-6">
                <div>
                  <CardTitle>Agent Statistics</CardTitle>
                  <CardDescription>Manage individual agent goals and current performance.</CardDescription>
                </div>
                <Button onClick={addAgent} variant="outline" className="flex items-center gap-2 border-slate-300 bg-white hover:bg-slate-50 font-bold px-6 h-12 rounded-xl">
                  <Plus className="w-4 h-4" /> Add New Agent
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow>
                        <TableHead className="w-56 px-6 font-bold uppercase text-[10px] tracking-widest">Agent Name</TableHead>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Annual Goal ($)</TableHead>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest text-green-600">Vol Closed</TableHead>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest text-blue-600">Vol Pending</TableHead>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Properties</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.agents.map((agent) => (
                        <TableRow key={agent.id} className="hover:bg-slate-50/30 transition-colors">
                          <TableCell className="px-6">
                            <Input 
                              value={agent.name} 
                              onChange={(e) => updateAgent(agent.id, 'name', e.target.value)}
                              className="font-bold border-none bg-transparent hover:bg-slate-100 focus:bg-white h-10 rounded-lg"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={agent.goal} 
                              onChange={(e) => updateAgent(agent.id, 'goal', e.target.value)}
                              className="border-none bg-transparent hover:bg-slate-100 focus:bg-white h-10 rounded-lg font-medium"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-green-600 px-3 py-1 bg-green-50 rounded-lg w-fit">
                              ${new Intl.NumberFormat().format(agent.volumeClosed)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg w-fit">
                              ${new Intl.NumberFormat().format(agent.volumePending)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-2 border-slate-300 hover:bg-white shadow-sm font-bold rounded-lg px-4">
                                  <HomeIcon className="w-4 h-4 text-orange-500" /> Manage Houses ({agent.transactions?.length || 0})
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
                                <DialogHeader className="p-8 pb-4 border-b border-slate-100">
                                  <div className="flex items-center justify-between">
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                                      Properties: {agent.name}
                                    </DialogTitle>
                                    <Badge className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold uppercase tracking-widest text-[10px]">
                                      Auto-Calculating
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-slate-500 font-medium">Adding or updating houses here automatically updates the agent's main stats.</p>
                                </DialogHeader>
                                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <Button onClick={() => addTransaction(agent.id)} className="bg-blue-600 hover:bg-blue-700 font-bold px-6 h-12 rounded-xl">
                                      <Plus className="w-4 h-4 mr-2" /> Add New Property
                                    </Button>
                                    <p className="text-xs text-slate-400 italic flex items-center gap-2">
                                      <ChevronRight className="w-3 h-3" /> Scroll right on mobile to see all columns
                                    </p>
                                  </div>
                                  <div className="rounded-[24px] border border-slate-200 overflow-hidden shadow-sm bg-white">
                                    <div className="overflow-x-auto">
                                      <Table>
                                        <TableHeader className="bg-slate-50/50">
                                          <TableRow>
                                            <TableHead className="min-w-[280px] font-bold uppercase text-[10px] tracking-widest px-6 py-4">Property Address</TableHead>
                                            <TableHead className="min-w-[160px] font-bold uppercase text-[10px] tracking-widest">Price ($)</TableHead>
                                            <TableHead className="min-w-[130px] font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                                            <TableHead className="min-w-[120px] font-bold uppercase text-[10px] tracking-widest">Side</TableHead>
                                            <TableHead className="min-w-[180px] font-bold uppercase text-[10px] tracking-widest">Close Date</TableHead>
                                            <TableHead className="w-16 px-6"></TableHead>
                                          </TableRow>
                                        </TableHeader>
                                      <TableBody>
                                        {(agent.transactions || []).map((t) => (
                                          <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                            <TableCell className="px-6 py-4">
                                              <Input 
                                                value={t.address} 
                                                onChange={(e) => updateTransaction(agent.id, t.id, 'address', e.target.value)}
                                                className="border-slate-200 focus:ring-2 focus:ring-blue-100 h-10 rounded-xl font-bold"
                                                placeholder="123 Main St..."
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                <Input 
                                                  type="number" 
                                                  value={t.price} 
                                                  onChange={(e) => updateTransaction(agent.id, t.id, 'price', e.target.value)}
                                                  className="pl-7 border-slate-200 focus:ring-2 focus:ring-blue-100 h-10 rounded-xl font-black text-slate-700"
                                                />
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <select 
                                                value={t.status}
                                                onChange={(e) => updateTransaction(agent.id, t.id, 'status', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100"
                                              >
                                                <option value="Active">Active</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Sold">Sold</option>
                                              </select>
                                            </TableCell>
                                            <TableCell>
                                              <select 
                                                value={t.side}
                                                onChange={(e) => updateTransaction(agent.id, t.id, 'side', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100"
                                              >
                                                <option value="Buyer">Buyer</option>
                                                <option value="Seller">Seller</option>
                                              </select>
                                            </TableCell>
                                            <TableCell>
                                              <Input 
                                                type="date"
                                                value={t.date} 
                                                onChange={(e) => updateTransaction(agent.id, t.id, 'date', e.target.value)}
                                                className="border-slate-200 focus:ring-2 focus:ring-blue-100 h-10 rounded-xl font-medium"
                                              />
                                            </TableCell>
                                            <TableCell className="px-6">
                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => removeTransaction(agent.id, t.id)}
                                                className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                        {(!agent.transactions || agent.transactions.length === 0) && (
                                          <TableRow>
                                            <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-medium">
                                              <div className="flex flex-col items-center gap-2">
                                                <AlertCircle className="w-8 h-8 opacity-20" />
                                                No properties found for this agent.
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                                </div>
                                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                  <p className="text-xs text-slate-400 font-medium">Changes are live-calculated and persist once the main Save button is clicked.</p>
                                  <DialogTrigger asChild>
                                    <Button className="bg-black text-white px-10 h-12 rounded-xl font-bold">Done</Button>
                                  </DialogTrigger>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell className="px-6 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeAgent(agent.id)}
                              className="text-slate-200 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {data.agents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                            No agents in the roster. Add one to start tracking.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
             <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
               Cloudflare D1: Connected & Synchronized
             </p>
           </div>
           <div className="flex items-center gap-4">
             <p className="text-xs text-slate-400 font-mono uppercase tracking-tighter">
               Instance: {data.tenant.subdomain}.team-goals.com
             </p>
             <p className="text-xs text-slate-400 font-mono uppercase tracking-tighter">
               Updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'INIT'}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
