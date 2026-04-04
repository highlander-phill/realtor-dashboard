import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface MasterEnv {
  DB: {
    prepare: (query: string) => {
      first: () => Promise<any>;
      all: () => Promise<{ results: any[] }>;
      bind: (...args: any[]) => { run: () => Promise<any> };
    };
  };
  KV?: {
    get: (key: string) => Promise<string | null>;
  };
  MASTER_PASSWORD?: string;
}

export async function GET() {
  try {
    const { env } = getRequestContext() as unknown as { env: MasterEnv };
    const db = env.DB;

    const authorized = await db.prepare("SELECT * FROM authorized_tenants ORDER BY created_at DESC").all();
    const activeTenants = await db.prepare("SELECT * FROM tenants").all();

    return NextResponse.json({
      authorized: authorized.results,
      active: activeTenants.results
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch master data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as unknown as { env: MasterEnv };
    const db = env.DB;
    
    const body = await req.json();
    const { action, subdomain, tempPassword, theme, customerName, customerPhone, tenantId, newPassword } = body;

    if (action === 'update_password') {
      await db.prepare("UPDATE tenants SET admin_password_hash = ? WHERE id = ?").bind(newPassword, tenantId).run();
      return NextResponse.json({ success: true, message: "Tenant password updated" });
    }

    const id = Math.random().toString(36).substr(2, 9);
    
    await db.prepare(
      "INSERT INTO authorized_tenants (id, subdomain, temp_password, theme, customer_name, customer_phone, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')"
    ).bind(id, subdomain, tempPassword, theme, customerName, customerPhone).run();

    // Generate SMS Template with PATH-BASED routing and auto-setup key
    const loginUrl = `https://www.team-goals.com/${subdomain}/onboarding?key=setup`;
    const smsTemplate = `Hi ${customerName}! Your ${theme} performance dashboard is ready. Setup your team at ${loginUrl} with temporary password: ${tempPassword}. - TeamGoals`;

    return NextResponse.json({ success: true, id, smsTemplate });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to authorize tenant" }, { status: 500 });
  }
}
