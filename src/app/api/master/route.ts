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

import { hashPassword } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as unknown as { env: MasterEnv };
    const db = env.DB;
    
    const body = await req.json();
    const { action, subdomain, tempPassword, theme, customerName, customerPhone, tenantId, newPassword, associatedEmail } = body;

    if (action === 'delete_tenant') {
      const tenantToDelete = await db.prepare("SELECT subdomain FROM tenants WHERE id = ?").bind(tenantId).first();
      if (tenantToDelete?.subdomain === 'nspg') {
        return NextResponse.json({ error: "Cannot delete the primary tenant." }, { status: 403 });
      }
      
      await db.prepare("DELETE FROM transactions WHERE tenant_id = ?").bind(tenantId).run();
      await db.prepare("DELETE FROM agents WHERE tenant_id = ?").bind(tenantId).run();
      await db.prepare("DELETE FROM sub_teams WHERE tenant_id = ?").bind(tenantId).run();
      await db.prepare("DELETE FROM team_data WHERE tenant_id = ?").bind(tenantId).run();
      await db.prepare("DELETE FROM users WHERE tenant_id = ?").bind(tenantId).run();
      await db.prepare("DELETE FROM tenants WHERE id = ?").bind(tenantId).run();
      
      return NextResponse.json({ success: true, message: "Tenant deleted." });
    }

    if (action === 'update_tenant') {
      if (newPassword) {
        const aHash = await hashPassword(newPassword);
        await db.prepare("UPDATE tenants SET admin_password_hash = ? WHERE id = ?").bind(aHash, tenantId).run();
      }
      
      if (associatedEmail) {
        // Find or create user for this email and link to tenant
        const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(associatedEmail).first();
        if (existing) {
           await db.prepare("UPDATE users SET tenant_id = ? WHERE email = ?").bind(tenantId, associatedEmail).run();
        } else {
           const userId = Math.random().toString(36).substr(2, 9);
           // Create user with a random high-entropy password hash that can't be guessed, 
           // they should use Google login anyway if associated this way.
           const dummyHash = await hashPassword(Math.random().toString(36));
           await db.prepare("INSERT INTO users (id, tenant_id, email, password_hash) VALUES (?, ?, ?, ?)").bind(userId, tenantId, associatedEmail, dummyHash).run();
        }
      }
      return NextResponse.json({ success: true, message: "Tenant access updated" });
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
