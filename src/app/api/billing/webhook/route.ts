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
    const context = getRequestContext();
    const env = (context?.env || process.env || {}) as any;
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
        // Check if there is a subscription and its status
        let status = 'active';
        if (session.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(session.subscription);
            status = sub.status;
          } catch (e) {
            console.error("Failed to retrieve subscription status:", e);
          }
        }
        await db.prepare("UPDATE tenants SET billing_status = ?, stripe_subscription_id = ? WHERE stripe_customer_id = ?")
          .bind(status, session.subscription, session.customer)
          .run();
        break;
      case 'customer.subscription.updated':
        const sub = event.data.object as any;
        const oldStatusResult = await db.prepare("SELECT billing_status, name FROM tenants WHERE stripe_customer_id = ?").bind(sub.customer).first();
        
        await db.prepare("UPDATE tenants SET billing_status = ? WHERE stripe_customer_id = ?")
          .bind(sub.status, sub.customer)
          .run();

        // Alert on conversion from trialing to active
        if (oldStatusResult?.billing_status === 'trialing' && sub.status === 'active' && env.SMTP2GO_API_KEY) {
           try {
              await fetch("https://api.smtp2go.com/v3/email/send", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                      api_key: env.SMTP2GO_API_KEY,
                      sender: "alerts@team-goals.com",
                      recipients: ["phill@phillsimpson.com"],
                      subject: `[Alert] Trial Converted: ${oldStatusResult.name}`,
                      html_body: `<p>A customer has successfully converted from trial to a paid subscription.</p>
                                 <p><strong>Tenant:</strong> ${oldStatusResult.name}</p>
                                 <p><strong>Status:</strong> ${sub.status}</p>`
                  })
              });
           } catch (e) {}
        }
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
