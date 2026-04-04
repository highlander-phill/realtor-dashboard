"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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

interface Agent {
  id: string;
  name: string;
  goal: number;
  volumeClosed: number;
  volumePending: number;
  listingsVolume: number;
  mlsLink?: string;
  transactions: Transaction[];
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
  agents: Agent[];
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
  agents: [],
  lastUpdated: new Date().toISOString(),
};

export default function Dashboard() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const [data, setData] = useState<DashboardData>(initialData);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/dashboard?subdomain=${subdomain}`);
        if (response.ok) {
          const cloudData = await response.json();
          if (!cloudData.tenant || !cloudData.tenant.onboardingCompleted) {
             router.push(`/${subdomain}/onboarding`);
             return;
          }
          setData(cloudData);
        } else {
          router.push(`/${subdomain}/onboarding`);
        }
      } catch (err) {
        console.error("API Error:", err);
        router.push(`/${subdomain}/onboarding`);
      }
    }
    if (subdomain) fetchData();
  }, [subdomain, router]);

  const teamPercentage = Math.round((data.team.ytdProduction / data.team.goal) * 100);

  const theme = data.tenant.theme || 'realtor';
  const labels = {
    realtor: {
      production: "Volume Closed",
      pending: "Volume Pending",
      goal: "Annual Production Goal",
      unit: "Houses",
    },
    sales: {
      production: "Revenue Closed",
      pending: "Pipeline Value",
      goal: "Sales Target",
      unit: "Deals",
    },
    insurance: {
      production: "Premiums Written",
      pending: "Pending Quotes",
      goal: "Premium Target",
      unit: "Policies",
    },
    custom: {
      production: "Total Production",
      pending: "In Progress",
      goal: "Annual Target",
      unit: "Units",
    }
  }[theme as keyof typeof labels] || {
    production: "Volume Closed",
    pending: "Volume Pending",
    goal: "Annual Production Goal",
    unit: "Houses",
  };

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
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase">
              <div className="bg-black text-white p-2 rounded" style={{ backgroundColor: data.tenant.primaryColor }}>
                {data.tenant.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              {data.tenant.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Team Performance Dashboard</p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
              <Clock className="w-4 h-4" />
              Last updated: {format(new Date(data.lastUpdated), "MMM d, yyyy h:mm a")}
            </div>
            <Link href={`/${subdomain}/admin`}>
              <Button variant="outline" size="sm" className="bg-white hover:bg-slate-100 text-slate-700 font-bold border-slate-200">
                Admin Login
              </Button>
            </Link>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">{labels.production} Tracker</CardTitle>
                <TrendingUp className="text-blue-500 w-6 h-6" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{labels.production} YTD</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-slate-50">{formatCurrency(data.team.ytdProduction)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{labels.goal}</p>
                  <p className="text-4xl font-black text-slate-400">{formatCurrency(data.team.goal)}</p>
                </div>
                <div className="flex items-end justify-start md:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Target Achieved</p>
                    <p className="text-5xl font-black text-blue-600 dark:text-blue-400">{teamPercentage}%</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress value={teamPercentage} className="h-4 bg-slate-100 dark:bg-slate-800" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
                      <TableHead>Agent Name</TableHead>
                      <TableHead className="text-right">{labels.production}</TableHead>
                      <TableHead className="text-right">{labels.pending}</TableHead>
                      <TableHead className="text-right">Progress %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.agents.map((agent) => {
                      const agentProgress = Math.round((agent.volumeClosed / agent.goal) * 100); 
                      return (
                        <TableRow key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                            {agent.name}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600">{formatCurrency(agent.volumeClosed)}</TableCell>
                          <TableCell className="text-right text-blue-600 dark:text-blue-400 font-medium">{formatCurrency(agent.volumePending)}</TableCell>
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
      </div>
    </div>
  );
}
