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

export async function GET(req: NextRequest) {
  try {
    let env: D1Env;
    try {
      env = getRequestContext().env as unknown as D1Env;
    } catch {
      return NextResponse.json({ error: "Local development mode" }, { status: 500 });
    }
    const db = env.DB;

    const host = req.headers.get('host') || '';
    const url = new URL(req.url);
    let subdomain = url.searchParams.get('subdomain');
    
    if (!subdomain) {
      if (host.includes('team-goals.com')) {
        const parts = host.split('.team-goals.com')[0];
        if (parts && parts !== 'www') subdomain = parts;
      } else if (host.includes('.pages.dev')) {
        subdomain = 'nspg';
      }
    }

    if (!subdomain) {
      subdomain = req.headers.get('x-realtor-subdomain') || 'demo';
    }

    const tenant = await db.prepare("SELECT * FROM tenants WHERE subdomain = ?").bind(subdomain).first();
    if (!tenant) {
      // Return a "not found" state that triggers onboarding
      return NextResponse.json({ 
        tenant: { name: "New Team", onboardingCompleted: false, subdomain },
        team: { goal: 50000000, ytdProduction: 0 },
        agents: [],
        lastUpdated: new Date().toISOString()
      });
    }

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
        onboardingCompleted: !!tenant.onboarding_completed,
      },
      team: {
        goal: teamData?.goal || 50000000,
        ytdProduction: teamData?.ytd_production || 0,
      },
      agents: agents.results.map((a) => ({
        ...a,
        volumeClosed: a.volume_closed || 0,
        volumePending: a.volume_pending || 0,
        listingsVolume: a.listings_volume || 0,
        mlsLink: a.mls_link,
        transactions: transactions.results.filter(t => t.agent_id === a.id).map(t => ({
          ...t,
          agentId: t.agent_id,
        })),
      })),
      lastUpdated: teamData?.last_updated || new Date().toISOString(),
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

    // 1. Upsert Tenant
    await db.prepare(
      "INSERT INTO tenants (id, name, subdomain, primary_color, theme, onboarding_completed) VALUES (?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(id) DO UPDATE SET name=excluded.name, primary_color=excluded.primary_color, theme=excluded.theme, onboarding_completed=excluded.onboarding_completed"
    ).bind(tenant.id, tenant.name, tenant.subdomain, tenant.primaryColor, tenant.theme || 'realtor', tenant.onboardingCompleted ? 1 : 0).run();

    // 2. Upsert Team Data
    await db.prepare(
      "INSERT INTO team_data (tenant_id, year, goal, ytd_production, last_updated) VALUES (?, 2026, ?, ?, ?) " +
      "ON CONFLICT(tenant_id, year) DO UPDATE SET goal=excluded.goal, ytd_production=excluded.ytd_production, last_updated=excluded.last_updated"
    ).bind(tenant.id, team.goal, team.ytdProduction, new Date().toISOString()).run();

    const statements = [
      db.prepare("DELETE FROM agents WHERE tenant_id = ?").bind(tenant.id),
      db.prepare("DELETE FROM transactions WHERE tenant_id = ?").bind(tenant.id),
      ...agents.map((a) => 
        db.prepare("INSERT INTO agents (id, tenant_id, name, goal, closings, volume_pending, volume_closed, listings_volume, buyers, sellers, listings, mls_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .bind(a.id, tenant.id, a.name, a.goal, a.closings || 0, a.volumePending || 0, a.volumeClosed || 0, a.listingsVolume || 0, a.buyers || 0, a.sellers || 0, a.listings || 0, a.mlsLink || null)
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
