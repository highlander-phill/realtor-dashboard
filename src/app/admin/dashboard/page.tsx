"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initialData, DashboardData, AgentData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export const runtime = "edge";

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>(initialData);
  const [isMounted, setIsMounted] = useState(false);
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
          setData(cloudData);
        } else {
          const savedData = localStorage.getItem("nspg_dashboard_data");
          if (savedData) {
            setData(JSON.parse(savedData));
          }
        }
      } catch (err) {
        console.error("API Error:", err);
      }
    }
    fetchData();
  }, [router]);

  const handleSave = async () => {
    const updatedData = { ...data, lastUpdated: new Date().toISOString() };
    
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        localStorage.setItem("nspg_dashboard_data", JSON.stringify(updatedData));
        alert("Dashboard data synced to Cloudflare successfully!");
      } else {
        // Fallback save to local storage if API fails
        localStorage.setItem("nspg_dashboard_data", JSON.stringify(updatedData));
        alert("Cloudflare sync failed, but data saved locally.");
      }
    } catch (err) {
      console.error("Save Error:", err);
      localStorage.setItem("nspg_dashboard_data", JSON.stringify(updatedData));
      alert("Network error. Data saved locally.");
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

  const addAgent = () => {
    const newAgent: AgentData = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Agent",
      goal: 0,
      closings: 0,
      volumePending: 0,
      buyers: 0,
      sellers: 0,
      listings: 0
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

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <header className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Management Portal
            </h1>
            <p className="text-slate-500 text-sm">Update the team goals and agent performance numbers.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> View Public Dashboard
              </Button>
            </Link>
            <Button onClick={handleSave} className="bg-black hover:bg-slate-800 text-white flex items-center gap-2 px-6">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
            <Button variant="ghost" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 h-12 w-full max-w-md">
            <TabsTrigger value="team" className="flex-1 font-bold">Team Overall</TabsTrigger>
            <TabsTrigger value="agents" className="flex-1 font-bold">Individual Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle>Team Performance Goals</CardTitle>
                <CardDescription>Adjust the primary team metrics here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="team-goal" className="text-sm font-bold uppercase tracking-wider">Annual Production Goal ($)</Label>
                    <Input 
                      id="team-goal" 
                      type="number" 
                      value={data.team.goal} 
                      onChange={(e) => updateTeam('goal', e.target.value)}
                      className="text-2xl font-bold h-14 bg-slate-50 border-slate-200 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="team-ytd" className="text-sm font-bold uppercase tracking-wider">Current YTD Production ($)</Label>
                    <Input 
                      id="team-ytd" 
                      type="number" 
                      value={data.team.ytdProduction} 
                      onChange={(e) => updateTeam('ytdProduction', e.target.value)}
                      className="text-2xl font-bold h-14 bg-slate-50 border-slate-200 focus:ring-black text-blue-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <Card className="border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Agent Statistics</CardTitle>
                  <CardDescription>Manage individual agent goals and current performance.</CardDescription>
                </div>
                <Button onClick={addAgent} variant="outline" className="flex items-center gap-2 border-slate-300">
                  <Plus className="w-4 h-4" /> Add New Agent
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow>
                        <TableHead className="w-48">Agent Name</TableHead>
                        <TableHead>Annual Goal ($)</TableHead>
                        <TableHead>Closings</TableHead>
                        <TableHead>Vol Pending ($)</TableHead>
                        <TableHead>Buyers</TableHead>
                        <TableHead>Sellers</TableHead>
                        <TableHead>Listings</TableHead>
                        <TableHead>MLS Link</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell>
                            <Input 
                              value={agent.name} 
                              onChange={(e) => updateAgent(agent.id, 'name', e.target.value)}
                              className="font-bold border-none bg-transparent hover:bg-slate-100 focus:bg-white"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={agent.goal} 
                              onChange={(e) => updateAgent(agent.id, 'goal', e.target.value)}
                              className="border-none bg-transparent hover:bg-slate-100 focus:bg-white"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={agent.closings} 
                              onChange={(e) => updateAgent(agent.id, 'closings', e.target.value)}
                              className="border-none bg-transparent hover:bg-slate-100 focus:bg-white font-bold"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={agent.volumePending} 
                              onChange={(e) => updateAgent(agent.id, 'volumePending', e.target.value)}
                              className="border-none bg-transparent hover:bg-slate-100 focus:bg-white text-blue-600"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={agent.buyers} 
                              onChange={(e) => updateAgent(agent.id, 'buyers', e.target.value)}
                              className="border-none bg-transparent hover:bg-slate-100 focus:bg-white"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={agent.sellers} 
                              onChange={(e) => updateAgent(agent.id, 'sellers', e.target.value)}
                              className="border-none bg-transparent hover:bg-slate-100 focus:bg-white"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={agent.listings} 
                              onChange={(e) => updateAgent(agent.id, 'listings', e.target.value)}
                              className="border-none bg-transparent hover:bg-slate-100 focus:bg-white"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={agent.mlsLink || ''} 
                              onChange={(e) => updateAgent(agent.id, 'mlsLink', e.target.value)}
                              placeholder="MLS Link"
                              className="border-none bg-transparent hover:bg-slate-100 focus:bg-white text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeAgent(agent.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
           <p className="text-center text-sm text-slate-500">
             Security Note: Data is currently persisted in local browser storage for this prototype. 
             Integrate with a database like Cloudflare D1 for team-wide persistent storage.
           </p>
        </div>
      </div>
    </div>
  );
}
