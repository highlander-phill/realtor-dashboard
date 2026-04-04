"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { initialData, AgentData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Target, TrendingUp, Home, Briefcase, Award } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const runtime = "edge";

export default function AgentDashboard() {
  const params = useParams();
  const [agent, setAgent] = useState<AgentData | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("nspg_dashboard_data");
    const currentData = savedData ? JSON.parse(savedData) : initialData;
    
    const foundAgent = currentData.agents.find((a: AgentData) => a.id === params.id);
    if (foundAgent) {
      setAgent(foundAgent);
    }
  }, [params.id]);

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <p className="text-xl font-bold">Agent not found</p>
          <Link href="/">
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

  const progressPercentage = Math.round((agent.closings / (agent.goal / 500000)) * 100);

  const chartData = [
    { name: 'Closings', value: agent.closings, goal: agent.goal / 500000 },
    { name: 'Buyers', value: agent.buyers },
    { name: 'Sellers', value: agent.sellers },
    { name: 'Listings', value: agent.listings },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back Button & Header */}
        <div className="flex flex-col gap-4">
          <Link href="/">
            <Button variant="ghost" className="w-fit flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Team Dashboard
            </Button>
          </Link>
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl">
                {agent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">{agent.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-600">Senior Partner</Badge>
                  <span className="text-slate-500 text-sm font-medium">NSPG Realty Team</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              {agent.mlsLink && (
                <a href={agent.mlsLink} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-initial">
                  <Button className="w-full bg-slate-900 hover:bg-black text-white flex items-center gap-2 py-6 px-8 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                    <Home className="w-5 h-5" /> View My Listings <ExternalLink className="w-4 h-4 ml-1 opacity-50" />
                  </Button>
                </a>
              )}
            </div>
          </header>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden group">
              <div className="h-1.5 bg-blue-500 w-full group-hover:h-3 transition-all" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest font-bold text-[10px]">Annual Revenue Goal</CardDescription>
                <CardTitle className="text-3xl font-black">{formatCurrency(agent.goal)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <Target className="w-4 h-4" /> Set for 2026
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden group">
              <div className="h-1.5 bg-green-500 w-full group-hover:h-3 transition-all" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest font-bold text-[10px]">YTD Performance</CardDescription>
                <CardTitle className="text-3xl font-black text-green-600">{progressPercentage}%</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-slate-500 font-medium">Currently on track for yearly goal</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden group">
              <div className="h-1.5 bg-purple-500 w-full group-hover:h-3 transition-all" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest font-bold text-[10px]">Current Pipeline</CardDescription>
                <CardTitle className="text-3xl font-black text-purple-600">{formatCurrency(agent.volumePending)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" /> Pending volume
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart View */}
          <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 lg:col-span-1 p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-bold flex items-center gap-2 uppercase tracking-tight">
                <Award className="w-5 h-5 text-orange-500" /> Key Performance Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 h-[300px] w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Listings & Sales Inventory */}
          <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-bold flex items-center gap-2 uppercase tracking-tight">
                <HomeIcon className="w-5 h-5 text-blue-500" /> Current Inventory & Sales
              </CardTitle>
              <CardDescription>Active and recently sold properties</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {agent.transactions && agent.transactions.length > 0 ? (
                  agent.transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{t.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-black px-1.5 py-0">
                            {t.side} Side
                          </Badge>
                          <span className="text-xs text-slate-500">{t.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 dark:text-slate-100">{formatCurrency(t.price)}</p>
                        <Badge className={`mt-1 ${
                          t.status === 'Sold' ? 'bg-green-500' : 
                          t.status === 'Pending' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <p>No transactions listed yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Center - Moved down or replaced */}
        </div>

      </div>
    </div>
  );
}
