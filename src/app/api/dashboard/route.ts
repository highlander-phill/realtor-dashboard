import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface D1Env {
  DB: {
    prepare: (query: string) => {
      first: () => Promise<any>;
      all: () => Promise<{ results: any[] }>;
      bind: (...args: any[]) => { run: () => Promise<any> };
    };
    batch: (statements: any[]) => Promise<any>;
  };
}

export async function GET() {
  try {
    let env: D1Env;
    try {
      env = getRequestContext().env as unknown as D1Env;
    } catch {
      return NextResponse.json({ error: "Local development mode" }, { status: 500 });
    }
    const db = env.DB;

    // TODO: Get subdomain from headers (set by middleware)
    const subdomain = "nspg"; 

    const tenant = await db.prepare("SELECT * FROM tenants WHERE subdomain = ?").bind(subdomain).first();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const teamData = await db.prepare("SELECT * FROM team_data WHERE tenant_id = ? AND year = 2026").bind(tenant.id).first();
    const agents = await db.prepare("SELECT * FROM agents WHERE tenant_id = ?").bind(tenant.id).all();
    const transactions = await db.prepare("SELECT * FROM transactions WHERE tenant_id = ?").bind(tenant.id).all();

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        logoUrl: tenant.logo_url,
        primaryColor: tenant.primary_color,
      },
      team: {
        goal: teamData.goal,
        ytdProduction: teamData.ytd_production,
      },
      agents: agents.results.map((a) => ({
        ...a,
        volumePending: a.volume_pending,
        mlsLink: a.mls_link,
        transactions: transactions.results.filter(t => t.agent_id === a.id).map(t => ({
          ...t,
          agentId: t.agent_id,
        })),
      })),
      lastUpdated: teamData.last_updated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as unknown as { env: D1Env };
    const db = env.DB;
    
    const body = await req.json();
    const { tenant, team, agents } = body as { tenant: any; team: any; agents: any[] };

    await db.prepare(
      "UPDATE team_data SET goal = ?, ytd_production = ?, last_updated = ? WHERE tenant_id = ? AND year = 2026"
    ).bind(team.goal, team.ytdProduction, new Date().toISOString(), tenant.id).run();

    const statements = [
      db.prepare("DELETE FROM agents WHERE tenant_id = ?").bind(tenant.id),
      db.prepare("DELETE FROM transactions WHERE tenant_id = ?").bind(tenant.id),
      ...agents.map((a) => 
        db.prepare("INSERT INTO agents (id, tenant_id, name, goal, closings, volume_pending, buyers, sellers, listings, mls_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .bind(a.id, tenant.id, a.name, a.goal, a.closings, a.volumePending, a.buyers, a.sellers, a.listings, a.mlsLink || null)
      ),
      ...agents.flatMap((a) => 
        (a.transactions || []).map((t: any) => 
          db.prepare("INSERT INTO transactions (id, agent_id, tenant_id, address, price, status, side, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(t.id, a.id, tenant.id, t.address, t.price, t.status, t.side, t.date)
        )
      )
    ];

    await db.batch(statements);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
