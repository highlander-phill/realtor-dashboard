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
            body: JSON.stringify({ tenantId: tenant.id, priceId: 'price_123' }), // REPLACE WITH ACTUAL PRICE ID
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
                            {tenant.billingStatus || 'free'}
                        </Badge>
                    </div>
                    {tenant.billingStatus === 'free' ? (
                        <Button onClick={handleUpgrade} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-2">
                            <CreditCard className="w-4 h-4" /> Upgrade to Pro
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
