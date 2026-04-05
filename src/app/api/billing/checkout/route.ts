import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as unknown as { env: D1Env };
    const db = env.DB;
    const { tenantId, priceId } = await req.json();

    const tenant = await db.prepare("SELECT * FROM tenants WHERE id = ?").bind(tenantId).first();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    let customerId = tenant.stripe_customer_id;
    if (!customerId) {
        const customer = await stripe.customers.create({
            metadata: { tenantId: tenant.id }
        });
        customerId = customer.id;
        await db.prepare("UPDATE tenants SET stripe_customer_id = ? WHERE id = ?").bind(customerId, tenant.id).run();
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
