"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { initialData, DashboardData, AgentData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Home, DollarSign, PieChart, Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export const runtime = "edge";

export default function AgentDetail() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const id = params.id as string;
  const [data, setData] = useState<DashboardData>(initialData);
  const router = useRouter();

  useEffect(() => {
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
          <CardHeader className="bg-slate-900 text-white p-8">
             <CardTitle className="text-xl">Transaction History</CardTitle>
             <CardDescription className="text-slate-400">Underlying data driving agent performance metrics.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader className="bg-slate-50">
                   <TableRow>
                      <TableHead className="px-8 py-4 font-bold uppercase text-[10px] tracking-widest">Property</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest">Price</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest px-8">Side</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {(agent.transactions || []).map((t) => (
                      <TableRow key={t.id} className="hover:bg-slate-50 transition-colors">
                         <TableCell className="px-8 py-6">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                  <MapPin className="w-4 h-4 text-slate-400" />
                               </div>
                               <span className="font-bold text-slate-900">{t.address}</span>
                            </div>
                         </TableCell>
                         <TableCell className="font-black text-slate-700">{formatCurrency(t.price)}</TableCell>
                         <TableCell>
                            <Badge className={`${t.status === 'Sold' ? 'bg-green-500' : t.status === 'Pending' ? 'bg-blue-500' : 'bg-orange-500'} text-white border-none text-[10px] font-black uppercase`}>
                               {t.status}
                            </Badge>
                         </TableCell>
                         <TableCell className="px-8">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                               <Tag className="w-3 h-3" /> {t.side} Represented
                            </span>
                         </TableCell>
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
