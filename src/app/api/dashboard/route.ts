import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    let env;
    try {
      env = getRequestContext().env;
    } catch (e) {
      console.warn("Cloudflare context not found, using mock data for local dev");
      // For local dev, we don't have DB, so return a sample or error
      return NextResponse.json({ error: "Local development mode: Please use localStorage or configure Cloudflare bindings." }, { status: 500 });
    }
    const db = env.DB;

    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const teamData = await db.prepare("SELECT * FROM team_data WHERE id = 1").first();
    const agents = await db.prepare("SELECT * FROM agents").all();

    return NextResponse.json({
      team: {
        goal: teamData.goal,
        ytdProduction: teamData.ytd_production,
      },
      agents: agents.results.map((a: any) => ({
        ...a,
        volumePending: a.volume_pending,
        mlsLink: a.mls_link,
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
    const { env } = getRequestContext();
    const db = env.DB;
    
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { team, agents } = body;

    // Use a transaction if possible, or batch updates
    // Update Team Data
    await db.prepare(
      "UPDATE team_data SET goal = ?, ytd_production = ?, last_updated = ? WHERE id = 1"
    ).bind(team.goal, team.ytdProduction, new Date().toISOString()).run();

    // Update Agents - For simplicity, we'll clear and re-insert or use UPSERT
    const statements = [
      db.prepare("DELETE FROM agents"),
      ...agents.map((a: any) => 
        db.prepare("INSERT INTO agents (id, name, goal, closings, volume_pending, buyers, sellers, listings, mls_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .bind(a.id, a.name, a.goal, a.closings, a.volumePending, a.buyers, a.sellers, a.listings, a.mlsLink || null)
      )
    ];

    await db.batch(statements);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
