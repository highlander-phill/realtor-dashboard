"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Plus, Send, Copy, Check, Users, Layout, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const runtime = "edge";

export default function MasterDashboard() {
  const [authorized, setAuthorized] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subdomain: "",
    tempPassword: Math.random().toString(36).substr(2, 8),
    theme: "realtor",
    customerName: "",
    customerPhone: "",
  });
  const [generatedSms, setGeneratedSms] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch('/api/master');
    if (res.ok) {
      const data = await res.json();
      setAuthorized(data.authorized);
      setActive(data.active);
    }
  };

  const handleAuthorize = async () => {
    const res = await fetch('/api/master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const result = await res.json();
      setGeneratedSms(result.smsTemplate);
      fetchData();
      setFormData({
        subdomain: "",
        tempPassword: Math.random().toString(36).substr(2, 8),
        theme: "realtor",
        customerName: "",
        customerPhone: "",
      });
    }
  };

  const copySms = () => {
    navigator.clipboard.writeText(generatedSms);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              <Shield className="w-10 h-10 text-blue-500" />
              TEAMGOALS MASTER CONTROL
            </h1>
            <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Provisioning & Multi-Tenant Management</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-black text-blue-400">{active.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Tenants</p>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-right">
              <p className="text-2xl font-black text-orange-400">{authorized.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Onboarding</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Authorize New Tenant */}
          <Card className="lg:col-span-1 bg-slate-900 border-slate-800 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-800/50 border-b border-slate-800">
              <CardTitle className="flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 text-green-500" /> Provision New Instance
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium">Create a subdomain and temporary login.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Customer Name</Label>
                <Input 
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-white h-12"
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Customer Phone</Label>
                <Input 
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-white h-12"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Desired Subdomain</Label>
                <div className="flex items-center">
                  <Input 
                    value={formData.subdomain}
                    onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase()})}
                    className="bg-slate-950 border-slate-800 text-white h-12 rounded-r-none border-r-0 font-bold"
                    placeholder="nspg"
                  />
                  <div className="h-12 px-4 flex items-center bg-slate-800 border border-slate-800 rounded-r-lg text-slate-500 font-bold text-sm">
                    .team-goals.com
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Theme / Vertical</Label>
                <select 
                  value={formData.theme}
                  onChange={(e) => setFormData({...formData, theme: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg h-12 px-3 text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="realtor">Real Estate (Houses/Closings)</option>
                  <option value="sales">General Sales (Volume/Targets)</option>
                  <option value="insurance">Insurance (Policies/Premiums)</option>
                  <option value="custom">Fully Custom / White Label</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Temporary Password</Label>
                <Input 
                  value={formData.tempPassword}
                  onChange={(e) => setFormData({...formData, tempPassword: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-blue-400 h-12 font-mono font-bold"
                />
              </div>
              <Button onClick={handleAuthorize} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 font-black uppercase tracking-widest mt-4 rounded-xl shadow-lg shadow-blue-900/20">
                Authorize & Generate SMS
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-8">
            
            {/* SMS Generator Display */}
            <AnimatePresence>
              {generatedSms && (
                <Card className="bg-blue-600 border-none shadow-2xl rounded-3xl overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Send className="w-5 h-5" /> SMS Invitation Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 space-y-4">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white font-medium leading-relaxed">
                      {generatedSms}
                    </div>
                    <div className="flex gap-4">
                      <Button onClick={copySms} className="flex-1 bg-white text-blue-600 hover:bg-blue-50 h-12 font-bold gap-2">
                        {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy SMS Text</>}
                      </Button>
                      <Button variant="ghost" onClick={() => setGeneratedSms("")} className="text-white/60 hover:text-white">
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>

            {/* Pending Authorizations */}
            <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-800/50 border-b border-slate-800">
                <CardTitle className="text-white">Pending Invitations</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Tenants authorized but haven't finished onboarding.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-800/30">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-6 py-4">Customer</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Subdomain</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Theme</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Temp Pass</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorized.map((a) => (
                      <TableRow key={a.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="px-6 py-4">
                          <p className="font-bold text-white">{a.customer_name}</p>
                          <p className="text-xs text-slate-500">{a.customer_phone}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-950 border-slate-700 text-slate-300 font-mono">
                            {a.subdomain}.team-goals.com
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {a.theme === 'realtor' ? <Layout className="w-3 h-3 text-orange-400" /> : <Users className="w-3 h-3 text-blue-400" />}
                            <span className="text-xs font-bold uppercase text-slate-400">{a.theme}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-blue-400 font-bold">{a.temp_password}</TableCell>
                        <TableCell>
                          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold uppercase text-[10px] tracking-widest">
                            Pending
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {authorized.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-500 font-medium">
                          No pending authorizations.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Active Tenants */}
            <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-800/50 border-b border-slate-800">
                <CardTitle className="text-white">Active Tenants</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Live dashboards currently in production.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-800/30">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-6 py-4">Group Name</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">URL</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Vertical</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {active.map((t) => (
                      <TableRow key={t.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: t.primary_color }}>
                              {t.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                            </div>
                            <span className="font-bold text-white">{t.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a href={`https://${t.subdomain}.team-goals.com`} target="_blank" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {t.subdomain}.team-goals.com
                          </a>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="border-slate-700 text-slate-500 uppercase text-[9px] font-bold">Standard</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-medium">
                          {new Date(t.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>; // Simplified for now as framer-motion is already available
}
