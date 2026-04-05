import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface D1Env {
  DB: {
    prepare: (query: string) => {
      bind: (...args: any[]) => { first: () => Promise<any> };
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as unknown as { env: D1Env };
    const db = env.DB;
    const { tenantId } = await req.json();

    const tenant = await db.prepare("SELECT stripe_customer_id FROM tenants WHERE id = ?").bind(tenantId).first();
    if (!tenant || !tenant.stripe_customer_id) return NextResponse.json({ error: "No customer found" }, { status: 404 });

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
