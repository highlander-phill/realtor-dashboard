"use client";

export const runtime = "edge";

import { useParams } from "next/navigation";
import { 
  ChevronLeft, 
  HelpCircle, 
  Users, 
  LayoutGrid, 
  Settings, 
  TrendingUp, 
  Shield, 
  CalendarClock,
  Tv,
  CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HelpPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const sections = [
        {
            title: "Roster Management",
            icon: Users,
            color: "text-blue-500",
            content: [
                {
                    label: "Goal ($)",
                    desc: "The annual sales volume target for an individual agent. This contributes to the team's total goal."
                },
                {
                    label: "Closed Volume",
                    desc: "The total dollar amount of deals successfully settled. This is the primary metric for the YTD production."
                },
                {
                    label: "Pending Volume",
                    desc: "Deals that are under contract but haven't closed yet. Useful for forecasting future production."
                },
                {
                    label: "Include Progress",
                    desc: "If unchecked, this agent's numbers will not be added to the team-wide totals. Useful for tracking trainees or outside referrers."
                }
            ]
        },
        {
            title: "Team Divisions",
            icon: LayoutGrid,
            color: "text-purple-500",
            content: [
                {
                    label: "Sub-Teams",
                    desc: "Group agents into specific pods or office locations. You can filter the main dashboard to show only a specific division."
                },
                {
                    label: "Division Goals",
                    desc: "Set separate targets for each sub-team. The 'Master Goal' is still calculated based on all active agents."
                }
            ]
        },
        {
            title: "System Settings",
            icon: Settings,
            color: "text-emerald-500",
            content: [
                {
                    label: "Date Listed",
                    desc: "Enables tracking of when a deal first went live. Used to calculate 'Time to Close' metrics."
                },
                {
                    label: "Price Delta",
                    desc: "Compares the initial List Price vs the final Sale Price. Shows your team's negotiation effectiveness."
                },
                {
                    label: "Public Viewer Password",
                    desc: "If set, anyone visiting your subdomain will be prompted for this password before seeing the dashboard data."
                }
            ]
        },
        {
            title: "Display & TV Mode",
            icon: Tv,
            color: "text-orange-500",
            content: [
                {
                    label: "TV Optimization",
                    desc: "The dashboard is designed for 4K office displays. It auto-refreshes every few minutes to ensure data is always live."
                },
                {
                    label: "Themes",
                    desc: "Choose between 'Real Estate', 'Insurance', or 'General Sales' to change labels like 'Closings' vs 'Policies' vs 'Deals'."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                <header className="flex items-center gap-6 bg-slate-900 p-8 rounded-[40px] shadow-2xl">
                    <Link href={`/${subdomain}/admin`}>
                        <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                           <HelpCircle className="w-5 h-5 text-blue-400" />
                           <h1 className="text-3xl font-black uppercase tracking-tight italic text-white leading-none">Knowledge Base</h1>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Documentation & Support Guide</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections.map((section, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="rounded-[32px] border-none shadow-xl h-full overflow-hidden bg-white dark:bg-slate-900">
                                <CardHeader className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 p-8">
                                    <CardTitle className="flex items-center gap-3 text-lg font-black uppercase italic tracking-tight">
                                        <section.icon className={`w-5 h-5 ${section.color}`} />
                                        {section.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    {section.content.map((item, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-3 h-3 text-slate-400" />
                                                <h4 className="font-black uppercase text-[10px] tracking-widest text-slate-900 dark:text-white">{item.label}</h4>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed pl-5">
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <Card className="rounded-[40px] bg-blue-600 border-none shadow-2xl shadow-blue-900/40">
                    <CardContent className="p-12 text-center space-y-6">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Need More Help?</h3>
                        <p className="text-blue-100 font-medium">Contact our support team for custom implementation or technical assistance.</p>
                        <Button variant="secondary" className="rounded-2xl font-black uppercase tracking-widest px-10 h-14 bg-white text-blue-600 hover:bg-blue-50 border-none">
                            Contact Support
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
