import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const context = getRequestContext();
    const env = (context?.env || process.env || {}) as any;
    const db = env.DB;

    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.prepare(`
      SELECT u.email, t.subdomain 
      FROM users u 
      JOIN tenants t ON u.tenant_id = t.id 
      WHERE LOWER(u.email) = LOWER(?)
    `).bind(email).first();

    if (user) {
      return NextResponse.json({ exists: true, subdomain: user.subdomain });
    }

    // Also check agents table
    const agent = await db.prepare(`
      SELECT a.email, t.subdomain 
      FROM agents a 
      JOIN tenants t ON a.tenant_id = t.id 
      WHERE LOWER(a.email) = LOWER(?)
    `).bind(email).first();

    if (agent) {
      return NextResponse.json({ exists: true, subdomain: agent.subdomain });
    }

    return NextResponse.json({ exists: false });
  } catch (error: any) {
    console.error("Check email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
