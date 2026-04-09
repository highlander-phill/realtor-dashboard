import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as unknown as { env: { DB: any, STRIPE_SECRET_KEY: string } };
    const db = env.DB;
    const { tenantId } = await req.json();

    const tenant = await db.prepare("SELECT stripe_customer_id, subdomain FROM tenants WHERE id = ?").bind(tenantId).first();
    if (!tenant || !tenant.stripe_customer_id) return NextResponse.json({ error: "No customer found" }, { status: 404 });

    const apiKey = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || 'sk_test_mock';

    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-24',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const returnUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.team-goals.com'}/admin/billing`);
    returnUrl.hostname = `${tenant.subdomain}.team-goals.com`;

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: returnUrl.toString(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
