"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, ExternalLink } from "lucide-react";

export default function BillingPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTenant() {
            const res = await fetch(`/api/dashboard?subdomain=${subdomain}`);
            if (res.ok) {
                const data = await res.json();
                setTenant(data.tenant);
            }
            setLoading(false);
        }
        fetchTenant();
    }, [subdomain]);

    const handleUpgrade = async () => {
        const res = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId: tenant.id, priceId: 'price_1TK7zZ4YkfnFDOD9XtoU6E6m' }),
        });
        const { url } = await res.json();
        if (url) window.location.href = url;
    };

    const handlePortal = async () => {
        const res = await fetch('/api/billing/portal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId: tenant.id }),
        });
        const { url } = await res.json();
        if (url) window.location.href = url;
    };

    if (loading) return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!tenant) return <div className="p-8">Tenant not found.</div>;

    const isNSPG = subdomain === 'nspg' || tenant.id === 'nspg-group';

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-black uppercase tracking-tight">Billing Management</h1>
            <Card className="rounded-[32px] border-slate-200 dark:border-slate-800 shadow-xl">
                <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-8 px-10">
                    <CardTitle className="text-xl font-black uppercase italic">Subscription Details</CardTitle>
                    <CardDescription>Manage your subscription and billing preferences.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="font-bold">Current Status:</p>
                        <Badge className="uppercase font-black px-4 py-1.5 rounded-full">
                            {isNSPG ? 'Free Forever' : (tenant.billingStatus || 'free')}
                        </Badge>
                    </div>

                    {!isNSPG && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                            <h3 className="text-blue-900 dark:text-blue-100 font-bold uppercase mb-2">Pricing Model</h3>
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                $1/month per 10 users. Your first 30 days are free! 
                                <br />
                                <span className="text-xs opacity-75">(Quantity is automatically adjusted based on your active agent count)</span>
                            </p>
                        </div>
                    )}

                    {isNSPG ? (
                        <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                            <p className="text-slate-500 font-bold uppercase">This tenant is exempt from billing.</p>
                        </div>
                    ) : tenant.billingStatus === 'free' ? (
                        <Button onClick={handleUpgrade} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-2">
                            <CreditCard className="w-4 h-4" /> Start 30-Day Free Trial
                        </Button>
                    ) : (
                        <Button onClick={handlePortal} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-2" variant="outline">
                             Manage Subscription <ExternalLink className="w-4 h-4" />
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
