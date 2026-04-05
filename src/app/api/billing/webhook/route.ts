import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface D1Env {
  DB: {
    prepare: (query: string) => {
      bind: (...args: any[]) => { run: () => Promise<any> };
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as unknown as { env: D1Env };
    const db = env.DB;
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as any;
        await db.prepare("UPDATE tenants SET billing_status = 'active', stripe_subscription_id = ? WHERE stripe_customer_id = ?")
          .bind(session.subscription, session.customer)
          .run();
        break;
      case 'customer.subscription.updated':
        const sub = event.data.object as any;
        await db.prepare("UPDATE tenants SET billing_status = ? WHERE stripe_customer_id = ?")
          .bind(sub.status, sub.customer)
          .run();
        break;
      case 'customer.subscription.deleted':
        const subDeleted = event.data.object as any;
        await db.prepare("UPDATE tenants SET billing_status = 'canceled' WHERE stripe_customer_id = ?")
          .bind(subDeleted.customer)
          .run();
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
