import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword, comparePasswords } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

// Lazy load auth to prevent initialization issues at top level
async function getAuth() {
  const { auth } = await import("@/auth");
  return auth();
}

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
    let env: D1Env & { SETTINGS: any };
    try {
      env = getRequestContext().env as any;
    } catch {
      return NextResponse.json({ error: "Local development mode" }, { status: 500 });
    }
    const db = env.DB;
    const kv = env.SETTINGS;

    // Rate Limiting
    const ip = req.headers.get("cf-connecting-ip") || "anonymous";
    await checkRateLimit(kv, `get_dash:${ip}`, 100, 60); 

    const host = req.headers.get('host') || '';
    const url = new URL(req.url);
    let subdomain = url.searchParams.get('subdomain');
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    if (!subdomain && pathParts.length > 0 && pathParts[0] !== 'api' && pathParts[0] !== 'master') {
      subdomain = pathParts[0];
    }
    
    if (!subdomain && host.includes('team-goals.com')) {
      const hostParts = host.split('.');
      if (hostParts.length >= 3 && hostParts[0] !== 'www') subdomain = hostParts[0];
    }

    const year = parseInt(url.searchParams.get('year') || '2026');
    const subTeamId = url.searchParams.get('subTeamId');
    const viewerPass = url.searchParams.get('password');

    const tenant = await db.prepare("SELECT * FROM tenants WHERE subdomain = ?").bind(subdomain).first();
    if (!tenant) {
      return NextResponse.json({ 
        tenant: { name: "New Team", onboardingCompleted: false, subdomain },
        team: { goal: 50000000, ytdProduction: 0 },
        agents: [],
        lastUpdated: new Date().toISOString()
      });
    }

    // Check Viewer Password
    if (tenant.viewer_password_hash) {
      const viewerAuthCookie = req.cookies.get(`tg_viewer_auth_${subdomain}`)?.value;
      const isAuthorized = viewerAuthCookie === 'true' || (viewerPass && await comparePasswords(viewerPass, tenant.viewer_password_hash));

      if (!isAuthorized) {
        return NextResponse.json({ 
          error: "Password required", 
          passwordProtected: true,
          tenantName: tenant.name,
          primaryColor: tenant.primary_color,
          logoUrl: tenant.logo_url
        }, { status: 403 });
      }
    }

    // Fetch team-wide or sub-team specific data
    const teamData = await db.prepare("SELECT * FROM team_data WHERE tenant_id = ? AND year = ? AND sub_team_id IS " + (subTeamId ? "?" : "NULL"))
      .bind(...(subTeamId ? [tenant.id, year, subTeamId] : [tenant.id, year]))
      .first();

    const subTeams = await db.prepare("SELECT * FROM sub_teams WHERE tenant_id = ?").bind(tenant.id).all();
    
    // Filter agents by tenant and optional sub-team
    let agentQuery = "SELECT * FROM agents WHERE tenant_id = ?";
    let agentBinds: any[] = [tenant.id];
    if (subTeamId) {
      agentQuery += " AND sub_team_id = ?";
      agentBinds.push(subTeamId);
    }
    const agents = await db.prepare(agentQuery).bind(...agentBinds).all();
    
    const transactions = await db.prepare("SELECT * FROM transactions WHERE tenant_id = ?").bind(tenant.id).all();
    
    // Ratios Calculation (Team Wide, all years for better stats or just selected? Usually selected)
    const yearTransactions = transactions.results.filter(t => t.year === year);
    const totalProduction = yearTransactions.filter(t => t.status === 'Sold').reduce((acc: number, t: any) => acc + (t.price || 0), 0);
    
    const teamRatios = {
      listingToClose: yearTransactions.filter((t: any) => t.status === 'Active').length > 0 ? (yearTransactions.filter((t: any) => t.status === 'Sold').length / yearTransactions.filter((t: any) => t.status === 'Active').length).toFixed(2) : "0",
      buyerToSeller: yearTransactions.filter((t: any) => t.side === 'Seller').length > 0 ? (yearTransactions.filter((t: any) => t.side === 'Buyer').length / yearTransactions.filter((t: any) => t.side === 'Seller').length).toFixed(2) : "0",
      avgDealSize: yearTransactions.filter((t: any) => t.status === 'Sold').length > 0 ? (totalProduction / yearTransactions.filter((t: any) => t.status === 'Sold').length).toFixed(0) : "0"
    };

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        logoUrl: tenant.logo_url,
        primaryColor: tenant.primary_color,
        theme: tenant.theme,
        darkMode: !!tenant.dark_mode,
        onboardingCompleted: !!tenant.onboarding_completed,
        showTimeToClose: !!tenant.show_time_to_close,
        showPriceDelta: !!tenant.show_price_delta,
        hasViewerPassword: !!tenant.viewer_password_hash,
        billingStatus: tenant.billing_status || 'free',
        stripeSubscriptionId: tenant.stripe_subscription_id
      },
      team: {
        goal: teamData?.goal || 50000000,
        ytdProduction: totalProduction,
        ratios: teamRatios
      },
      subTeams: subTeams.results || [],
      agents: (agents.results || []).map((a: any) => {
        const agentTransactions = (transactions.results || []).filter((t: any) => t.agent_id === a.id && t.year === year);
        const volumeClosed = agentTransactions.filter((t: any) => t.status === 'Sold').reduce((acc: number, t: any) => acc + (t.price || 0), 0);
        const volumePending = agentTransactions.filter((t: any) => t.status === 'Pending').reduce((acc: number, t: any) => acc + (t.price || 0), 0);
        const listingsVolume = agentTransactions.filter((t: any) => t.status === 'Active').reduce((acc: number, t: any) => acc + (t.price || 0), 0);
        
        const buyers = agentTransactions.filter((t: any) => t.side === 'Buyer').length;
        const sellers = agentTransactions.filter((t: any) => t.side === 'Seller').length;
        const bsRatio = sellers > 0 ? (buyers / sellers).toFixed(2) : (buyers > 0 ? "1.00" : "0.00");
        
        return {
          ...a,
          volumeClosed,
          volumePending,
          listingsVolume,
          buyers,
          sellers,
          mlsLink: a.mls_link,
          status: a.status || 'active',
          countInTotal: !!a.count_in_total,
          bsRatio,
          transactions: agentTransactions.map((t: any) => ({
            ...t,
            agentId: t.agent_id,
          })),
        };
      }),
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
    const { env } = getRequestContext() as any;
    const db = env.DB;
    const kv = env.SETTINGS;

    // Rate Limiting
    const ip = req.headers.get("cf-connecting-ip") || "anonymous";
    const rl = await checkRateLimit(kv, `post_dash:${ip}`, 20, 60);
    if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    
    // Auth Check
    const session = await getAuth();
    
    const body = await req.json();
    const { tenant, team, agents, subTeams, year = 2026, action } = body;

    // Resolve Tenant ID from Subdomain
    const existingTenant = await db.prepare("SELECT * FROM tenants WHERE subdomain = ?").bind(tenant.subdomain).first();
    
    // Authorization: Only allow the update if:
    // 1. The tenant doesn't exist yet (onboarding)
    // 2. OR The session user is an admin for this specific tenant
    if (existingTenant) {
      if (!session || !session.user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      // Check if user has access to this tenant
      const user = await db.prepare("SELECT * FROM users WHERE email = ? AND tenant_id = ?").bind(session.user.email, existingTenant.id).first();
      const agent = await db.prepare("SELECT * FROM agents WHERE email = ? AND tenant_id = ?").bind(session.user.email, existingTenant.id).first();
      
      if (!user && !agent) {
         return NextResponse.json({ error: "Forbidden: You do not have management access to this tenant" }, { status: 403 });
      }
    }

    // Handle settings updates (Password, logo, column toggles)
    if (action === 'update_settings') {
      const { adminPassword, viewerPassword, logoUrl, name, primaryColor, showTimeToClose, showPriceDelta, darkMode } = body;
      const vHash = viewerPassword ? await hashPassword(viewerPassword) : null;
      
      let query = "UPDATE tenants SET name = ?, primary_color = ?, logo_url = ?, show_time_to_close = ?, show_price_delta = ?, dark_mode = ?, viewer_password_hash = ? WHERE subdomain = ?";
      let binds = [name, primaryColor, logoUrl, showTimeToClose ? 1 : 0, showPriceDelta ? 1 : 0, darkMode ? 1 : 0, vHash, tenant.subdomain];
      
      if (adminPassword) {
        const aHash = await hashPassword(adminPassword);
        query = "UPDATE tenants SET name = ?, primary_color = ?, logo_url = ?, show_time_to_close = ?, show_price_delta = ?, dark_mode = ?, viewer_password_hash = ?, admin_password_hash = ? WHERE subdomain = ?";
        binds = [name, primaryColor, logoUrl, showTimeToClose ? 1 : 0, showPriceDelta ? 1 : 0, darkMode ? 1 : 0, vHash, aHash, tenant.subdomain];
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
    const aHash = tenant.adminPassword ? await hashPassword(tenant.adminPassword) : null;
    await db.prepare(
      "INSERT INTO tenants (id, name, subdomain, primary_color, theme, onboarding_completed, logo_url, admin_password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(subdomain) DO UPDATE SET name=excluded.name, primary_color=excluded.primary_color, theme=excluded.theme, onboarding_completed=MAX(tenants.onboarding_completed, excluded.onboarding_completed), logo_url=excluded.logo_url, admin_password_hash=COALESCE(excluded.admin_password_hash, tenants.admin_password_hash)"
    ).bind(tenantId, tenant.name, tenant.subdomain, tenant.primaryColor, tenant.theme || 'realtor', tenant.onboardingCompleted ? 1 : 0, tenant.logoUrl || null, aHash).run();

    // 3. Upsert Team Data
    await db.prepare(
      "INSERT INTO team_data (tenant_id, year, goal, ytd_production, last_updated) VALUES (?, ?, ?, ?, ?) " +
      "ON CONFLICT(tenant_id, year) DO UPDATE SET goal=excluded.goal, ytd_production=excluded.ytd_production, last_updated=excluded.last_updated"
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
          db.prepare("INSERT INTO transactions (id, agent_id, tenant_id, address, price, list_price, date_listed, status, side, date, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(t.id, a.id, tenantId, t.address, t.price, t.listPrice || null, t.dateListed || null, t.status, t.side, t.date, year)
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
