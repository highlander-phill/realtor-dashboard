"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initialData, DashboardData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Home, DollarSign, PieChart, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";

export const runtime = "edge";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(initialData);
  const router = useRouter();

  useEffect(() => {
    // Version checking for TV auto-refresh
    let currentVersion: string | null = null;
    
    async function checkVersion() {
      try {
        const res = await fetch('/api/version');
        if (res.ok) {
          const { version } = await res.json();
          if (!currentVersion) {
            currentVersion = version;
          } else if (currentVersion !== version) {
            console.log("New version detected, reloading...");
            window.location.reload();
          }
        }
      } catch (err) {
        console.error("Version check failed", err);
      }
    }

    const interval = setInterval(checkVersion, 60000); // Check every minute
    checkVersion();
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const cloudData = await response.json();
          // Reset local storage if structure is old or onboarding not complete
          if (!cloudData.tenant || !cloudData.tenant.onboardingCompleted) {
             console.warn("Onboarding not completed or old format, redirecting");
             router.push("/onboarding");
             return;
          }
          setData(cloudData);
          localStorage.setItem("nspg_dashboard_data", JSON.stringify(cloudData));
        } else {
          // If API fails and no local data, go to onboarding
          const savedData = localStorage.getItem("nspg_dashboard_data");
          if (!savedData) {
            router.push("/onboarding");
          } else {
            const parsed = JSON.parse(savedData);
            if (parsed.tenant && parsed.tenant.onboardingCompleted) {
              setData(parsed);
            } else {
              router.push("/onboarding");
            }
          }
        }
      } catch (err) {
        console.error("API Error:", err);
        router.push("/onboarding");
      }
    }
    fetchData();
  }, [router]);

  const teamPercentage = Math.round((data.team.ytdProduction / data.team.goal) * 100);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase">
              <div className="bg-black text-white p-2 rounded" style={{ backgroundColor: data.tenant.primaryColor }}>
                {data.tenant.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              {data.tenant.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Team Performance & Sales Dashboard</p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
              <Clock className="w-4 h-4" />
              Last updated: {format(new Date(data.lastUpdated), "MMM d, yyyy h:mm a")}
            </div>
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-black">
                Admin Login
              </Button>
            </Link>
          </div>
        </header>

        {/* Team Overall Goal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Team Overall Production</CardTitle>
                <TrendingUp className="text-blue-500 w-6 h-6" />
              </div>
              <CardDescription>Year-to-Date Goal Progress</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1 cursor-help" title="Total sales volume closed by the entire team year-to-date">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Current YTD</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-slate-50">{formatCurrency(data.team.ytdProduction)}</p>
                </div>
                <div className="space-y-1 cursor-help" title="The total team production goal for the calendar year">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Annual Goal</p>
                  <p className="text-4xl font-black text-slate-400">{formatCurrency(data.team.goal)}</p>
                </div>
                <div className="flex items-end justify-start md:justify-end cursor-help" title="Percentage of the annual goal that has been reached so far">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Target Achieved</p>
                    <p className="text-5xl font-black text-blue-600 dark:text-blue-400">{teamPercentage}%</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
                <Progress value={teamPercentage} className="h-4 bg-slate-100 dark:bg-slate-800" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Individual Agent Performance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                <CardTitle>Agent Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <TableRow>
                      <TableHead className="font-bold cursor-help" title="The full name of the agent">Agent Name</TableHead>
                      <TableHead className="text-right font-bold cursor-help" title="The annual production goal set for this agent">Annual Goal</TableHead>
                      <TableHead className="text-right font-bold cursor-help" title="Total number of successfully closed transactions YTD">Closings</TableHead>
                      <TableHead className="text-right font-bold cursor-help" title="Total dollar volume currently in the pending phase">Volume Pending</TableHead>
                      <TableHead className="text-center font-bold cursor-help" title="Ratio of Buyer represented vs Seller represented transactions">B/S Ratio</TableHead>
                      <TableHead className="text-right font-bold cursor-help" title="Number of active properties currently listed by this agent">Listings</TableHead>
                      <TableHead className="text-right font-bold cursor-help" title="Percent of annual goal achieved so far">Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.agents.map((agent) => {
                      const agentProgress = Math.round((agent.closings / (agent.goal / 500000)) * 100); // Simplified calculation for demo
                      return (
                        <TableRow key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                            <Link href={`/agent/${agent.id}`} className="hover:text-blue-600 transition-colors flex items-center gap-2 group">
                              {agent.name}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          </TableCell>
                          <TableCell className="text-right text-slate-500">{formatCurrency(agent.goal)}</TableCell>
                          <TableCell className="text-right font-bold">{agent.closings}</TableCell>
                          <TableCell className="text-right text-blue-600 dark:text-blue-400 font-medium">{formatCurrency(agent.volumePending)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-1">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                {agent.buyers}B
                              </Badge>
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
                                {agent.sellers}S
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-700 dark:text-slate-300">{agent.listings}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs font-bold">{agentProgress}%</span>
                              <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-green-500 h-full rounded-full" 
                                  style={{ width: `${Math.min(agentProgress, 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Home className="w-4 h-4 text-orange-500" />
                Active Team Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.agents.reduce((sum, a) => sum + a.listings, 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Total Pending Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(data.agents.reduce((sum, a) => sum + a.volumePending, 0))}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-500" />
                Total Closings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.agents.reduce((sum, a) => sum + a.closings, 0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-400 text-xs">
          <p>© 2026 Nik Shehu Property Group. All rights reserved.</p>
          <Link href="/admin/login" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            Admin Access
          </Link>
        </footer>

      </div>
    </div>
  );
}
