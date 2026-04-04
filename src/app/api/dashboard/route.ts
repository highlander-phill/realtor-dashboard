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
    const year = parseInt(url.searchParams.get('year') || '2026');
    const subTeamId = url.searchParams.get('subTeamId');
    
    if (!subdomain) {
      if (host.includes('team-goals.com')) {
        const parts = host.split('.');
        if (parts.length >= 3 && parts[0] !== 'www') subdomain = parts[0];
      }
    }

    if (!subdomain) {
      subdomain = req.headers.get('x-realtor-subdomain') || 'demo';
    }

    const tenant = await db.prepare("SELECT * FROM tenants WHERE subdomain = ?").bind(subdomain).first();
    if (!tenant) {
      return NextResponse.json({ 
        tenant: { name: "New Team", onboardingCompleted: false, subdomain },
        team: { goal: 50000000, ytdProduction: 0 },
        agents: [],
        lastUpdated: new Date().toISOString()
      });
    }

    // Fetch team-wide or sub-team specific data
    const teamData = await db.prepare("SELECT * FROM team_data WHERE tenant_id = ? AND year = ? AND sub_team_id IS " + (subTeamId ? "?" : "NULL"))
      .bind(...(subTeamId ? [tenant.id, year, subTeamId] : [tenant.id, year]))
      .first();

    const subTeams = await db.prepare("SELECT * FROM sub_teams WHERE tenant_id = ?").bind(tenant.id).all();
    
    // Filter agents by tenant and optional sub-team
    let agentQuery = "SELECT * FROM agents WHERE tenant_id = ?";
    let agentBinds = [tenant.id];
    if (subTeamId) {
      agentQuery += " AND sub_team_id = ?";
      agentBinds.push(subTeamId);
    }
    const agents = await db.prepare(agentQuery).bind(...agentBinds).all();
    
    const transactions = await db.prepare("SELECT * FROM transactions WHERE tenant_id = ? AND year = ?").bind(tenant.id, year).all();

    // Ratios Calculation
    const stats = agents.results.reduce((acc, a) => {
      acc.closings += (a.closings || 0);
      acc.listings += (a.listings || 0);
      acc.buyers += (a.buyers || 0);
      acc.sellers += (a.sellers || 0);
      acc.pending += (a.volume_pending || 0);
      return acc;
    }, { closings: 0, listings: 0, buyers: 0, sellers: 0, pending: 0 });

    const ratios = {
      listingToClose: stats.listings > 0 ? (stats.closings / stats.listings).toFixed(2) : "0",
      buyerToSeller: stats.sellers > 0 ? (stats.buyers / stats.sellers).toFixed(2) : "0",
      avgDealSize: stats.closings > 0 ? (teamData?.ytd_production / stats.closings).toFixed(0) : "0"
    };

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        logoUrl: tenant.logo_url,
        primaryColor: tenant.primary_color,
        theme: tenant.theme,
        onboardingCompleted: !!tenant.onboarding_completed,
      },
      team: {
        goal: teamData?.goal || 50000000,
        ytdProduction: teamData?.ytd_production || 0,
        ratios
      },
      subTeams: subTeams.results,
      agents: agents.results.map((a) => ({
        ...a,
        volumeClosed: a.volume_closed || 0,
        volumePending: a.volume_pending || 0,
        listingsVolume: a.listings_volume || 0,
        mlsLink: a.mls_link,
        status: a.status || 'active',
        countInTotal: !!a.count_in_total,
        transactions: transactions.results.filter(t => t.agent_id === a.id).map(t => ({
          ...t,
          agentId: t.agent_id,
        })),
      })),
      lastUpdated: teamData?.last_updated || new Date().toISOString(),
      year
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
    const { tenant, team, agents, subTeams, year = 2026, action } = body;

    // Handle password/logo updates if specifically requested
    if (action === 'update_settings') {
      const { adminPassword, logoUrl, name, primaryColor } = body;
      let query = "UPDATE tenants SET name = ?, primary_color = ?, logo_url = ? WHERE subdomain = ?";
      let binds = [name, primaryColor, logoUrl, tenant.subdomain];
      
      if (adminPassword) {
        query = "UPDATE tenants SET name = ?, primary_color = ?, logo_url = ?, admin_password_hash = ? WHERE subdomain = ?";
        binds = [name, primaryColor, logoUrl, adminPassword, tenant.subdomain];
      }
      await db.prepare(query).bind(...binds).run();
      return NextResponse.json({ success: true });
    }

    // 1. Resolve Tenant ID
    let tenantId = tenant.id;
    const existing = await db.prepare("SELECT id FROM tenants WHERE subdomain = ?").bind(tenant.subdomain).first();
    if (existing) {
      tenantId = existing.id;
    }

    // 2. Upsert Tenant
    await db.prepare(
      "INSERT INTO tenants (id, name, subdomain, primary_color, theme, onboarding_completed, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(subdomain) DO UPDATE SET name=excluded.name, primary_color=excluded.primary_color, theme=excluded.theme, onboarding_completed=excluded.onboarding_completed, logo_url=excluded.logo_url"
    ).bind(tenantId, tenant.name, tenant.subdomain, tenant.primaryColor, tenant.theme || 'realtor', tenant.onboardingCompleted ? 1 : 0, tenant.logoUrl).run();

    // 3. Upsert Team Data for the specific year
    await db.prepare(
      "INSERT INTO team_data (tenant_id, year, goal, ytd_production, last_updated) VALUES (?, ?, ?, ?, ?) " +
      "ON CONFLICT(tenant_id, year, sub_team_id) DO UPDATE SET goal=excluded.goal, ytd_production=excluded.ytd_production, last_updated=excluded.last_updated"
    ).bind(tenantId, year, team.goal, team.ytdProduction, new Date().toISOString()).run();

    // 4. Batch update sub-teams, agents, and transactions
    const statements = [
      db.prepare("DELETE FROM sub_teams WHERE tenant_id = ?").bind(tenantId),
      ...(subTeams || []).map((st: any) => 
        db.prepare("INSERT INTO sub_teams (id, tenant_id, name, goal) VALUES (?, ?, ?, ?)").bind(st.id, tenantId, st.name, st.goal)
      ),
      db.prepare("DELETE FROM agents WHERE tenant_id = ?").bind(tenantId),
      db.prepare("DELETE FROM transactions WHERE tenant_id = ?").bind(tenantId),
      ...agents.map((a: any) => 
        db.prepare("INSERT INTO agents (id, tenant_id, sub_team_id, name, goal, closings, volume_pending, volume_closed, listings_volume, buyers, sellers, listings, mls_link, status, count_in_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .bind(a.id, tenantId, a.subTeamId || null, a.name, a.goal, a.closings || 0, a.volumePending || 0, a.volumeClosed || 0, a.listingsVolume || 0, a.buyers || 0, a.sellers || 0, a.listings || 0, a.mlsLink || null, a.status || 'active', a.countInTotal ? 1 : 0)
      ),
      ...agents.flatMap((a: any) => 
        (a.transactions || []).map((t: any) => 
          db.prepare("INSERT INTO transactions (id, agent_id, tenant_id, address, price, status, side, date, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(t.id, a.id, tenantId, t.address, t.price, t.status, t.side, t.date, year)
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
