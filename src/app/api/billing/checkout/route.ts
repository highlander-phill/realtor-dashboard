import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as unknown as { env: { DB: any, STRIPE_SECRET_KEY: string } };
    const db = env.DB;
    const { tenantId, priceId } = await req.json();

    const tenant = await db.prepare("SELECT * FROM tenants WHERE id = ?").bind(tenantId).first();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    // Bypass for NSPG
    if (tenant.subdomain === 'nspg' || tenant.id === 'nspg-group') {
        return NextResponse.json({ error: "NSPG tenant is free forever and does not require a subscription." }, { status: 400 });
    }

    const apiKey = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
    const priceId = env.STRIPE_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_123';
    
    const stripe = new Stripe(apiKey, {
        apiVersion: '2025-02-24',
        httpClient: Stripe.createFetchHttpClient(),
    });

    // Calculate initial quantity based on agent count (1 quantity per 10 users)
    const agentsResult = await db.prepare("SELECT COUNT(*) as count FROM agents WHERE tenant_id = ?").bind(tenant.id).first();
    const agentCount = agentsResult?.count || 0;
    const quantity = Math.max(1, Math.ceil(agentCount / 10));

    let customerId = tenant.stripe_customer_id;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: tenant.admin_email || undefined,
            name: tenant.name,
            metadata: { tenantId: tenant.id }
        });
        customerId = customer.id;
        await db.prepare("UPDATE tenants SET stripe_customer_id = ? WHERE id = ?").bind(customerId, tenant.id).run();
    }

    const successUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.team-goals.com'}/admin/billing?success=true`);
    const cancelUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.team-goals.com'}/admin/billing?canceled=true`);
    
    // Ensure the domain matches the tenant's subdomain for better UX
    successUrl.hostname = `${tenant.subdomain}.team-goals.com`;
    cancelUrl.hostname = `${tenant.subdomain}.team-goals.com`;

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: quantity }],
        subscription_data: {
            trial_period_days: 30,
            metadata: { tenantId: tenant.id }
        },
        success_url: successUrl.toString(),
        cancel_url: cancelUrl.toString(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
