export const runtime = "edge";

"use client";

import { useState, useEffect } from "react";

export default function AdminPanel() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"agents" | "settings">("agents");

  useEffect(() => {
    // Check local auth
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
      transactions: []
    };
    setData({ ...data, agents: [...data.agents, newAgent] });
  };

  const removeAgent = (id: string) => {
    if (confirm("Are you sure you want to remove this agent?")) {
      setData({ ...data, agents: data.agents.filter(a => a.id !== id) });
    }
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

  const resetOnboarding = () => {
    if (confirm("This will clear all team data and reset the dashboard. Are you sure?")) {
      router.push(`/${subdomain}/onboarding`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
             <Link href={`/${subdomain}`}>
               <Button variant="ghost" size="icon" className="rounded-full">
                 <ChevronLeft className="w-5 h-5" />
               </Button>
             </Link>
             <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Admin Management</h1>
                <p className="text-slate-500 text-sm font-medium">{data.tenant.name} • {subdomain}</p>
             </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2">
              {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
            <Button onClick={handleLogout} variant="outline" className="rounded-xl font-bold gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </header>

        <div className="flex gap-4">
           <Button 
            variant={activeTab === "agents" ? "default" : "ghost"} 
            onClick={() => setActiveTab("agents")}
            className="rounded-full font-bold uppercase text-[10px] tracking-widest px-6"
           >
             Agent Management
           </Button>
           <Button 
            variant={activeTab === "settings" ? "default" : "ghost"} 
            onClick={() => setActiveTab("settings")}
            className="rounded-full font-bold uppercase text-[10px] tracking-widest px-6"
           >
             Team Settings
           </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "agents" ? (
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
                    <CardTitle className="text-lg font-bold">Roster & Production</CardTitle>
                    <CardDescription>Manage your team members and their individual targets.</CardDescription>
                  </div>
                  <Button onClick={addAgent} variant="outline" className="bg-white border-slate-200 font-bold gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Agent
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest">Name</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Goal ($)</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Closed ($)</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Pending ($)</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Inventory ($)</TableHead>
                        <TableHead className="text-right px-8 font-bold text-[10px] uppercase tracking-widest">Actions</TableHead>
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
                            <Input 
                              type="number"
                              value={agent.goal} 
                              onChange={(e) => updateAgent(agent.id, "goal", Number(e.target.value))}
                              className="bg-transparent border-slate-200 focus:bg-white h-10 font-mono text-xs font-bold"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={agent.volumeClosed} 
                              onChange={(e) => updateAgent(agent.id, "volumeClosed", Number(e.target.value))}
                              className="bg-transparent border-slate-200 focus:bg-white h-10 font-mono text-xs font-bold text-green-600"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={agent.volumePending} 
                              onChange={(e) => updateAgent(agent.id, "volumePending", Number(e.target.value))}
                              className="bg-transparent border-slate-200 focus:bg-white h-10 font-mono text-xs font-bold text-blue-600"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={agent.listingsVolume} 
                              onChange={(e) => updateAgent(agent.id, "listingsVolume", Number(e.target.value))}
                              className="bg-transparent border-slate-200 focus:bg-white h-10 font-mono text-xs font-bold text-orange-600"
                            />
                          </TableCell>
                          <TableCell className="text-right px-8">
                            <div className="flex justify-end gap-2">
                               <Link href={`/${subdomain}/agent/${agent.id}`}>
                                 <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                                   <Settings className="w-4 h-4" />
                                 </Button>
                               </Link>
                               <Button onClick={() => removeAgent(agent.id)} variant="ghost" size="icon" className="text-slate-400 hover:text-red-600">
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {data.agents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-medium italic">No agents added yet. Click 'Add Agent' to begin.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader>
                  <CardTitle>Team Configuration</CardTitle>
                  <CardDescription>Global settings for your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Name</Label>
                    <Input 
                      value={data.tenant.name}
                      onChange={(e) => setData({...data, tenant: {...data.tenant, name: e.target.value}})}
                      className="h-12 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Team Annual Goal ($)</Label>
                    <Input 
                      type="number"
                      value={data.team.goal}
                      onChange={(e) => setData({...data, team: {...data.team, goal: Number(e.target.value)}})}
                      className="h-12 font-bold text-blue-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Brand Color</Label>
                    <div className="flex gap-4">
                      <Input 
                        type="color"
                        value={data.tenant.primaryColor}
                        onChange={(e) => setData({...data, tenant: {...data.tenant, primaryColor: e.target.value}})}
                        className="w-12 h-12 p-1 rounded-lg"
                      />
                      <Input 
                        value={data.tenant.primaryColor}
                        onChange={(e) => setData({...data, tenant: {...data.tenant, primaryColor: e.target.value}})}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-100 dark:border-red-900 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-red-50 dark:bg-red-950/20">
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>Destructive actions that cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div className="space-y-4">
                      <p className="text-sm font-medium text-slate-500">Need to start over? This will wipe your current configuration and take you back to the setup wizard.</p>
                      <Button onClick={resetOnboarding} variant="destructive" className="w-full h-12 font-bold uppercase tracking-widest text-xs">
                        Reset & Rerun Onboarding
                      </Button>
                   </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
