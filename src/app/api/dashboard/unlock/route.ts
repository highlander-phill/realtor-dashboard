import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";
import { comparePasswords } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as any;
    const db = env.DB;
    const kv = env.SETTINGS;
    
    const { subdomain, password } = await req.json();
    
    // Rate Limiting by IP and Subdomain
    const ip = req.headers.get("cf-connecting-ip") || "anonymous";
    const rateLimitKey = `unlock:${subdomain}:${ip}`;
    const rl = await checkRateLimit(kv, rateLimitKey, 10, 600); // 10 attempts per 10 mins
    
    if (!rl.success) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }
    
    if (!subdomain || !password) {
      return NextResponse.json({ error: "Missing subdomain or password" }, { status: 400 });
    }

    const tenant = await db.prepare("SELECT * FROM tenants WHERE subdomain = ?").bind(subdomain).first();
    
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    if (!tenant.viewer_password_hash) {
      return NextResponse.json({ success: true, message: "No password required" });
    }

    const isMatch = await comparePasswords(password, tenant.viewer_password_hash);
    
    if (isMatch) {
      const response = NextResponse.json({ success: true });
      // Set a secure, HTTP-only cookie that expires in 30 days
      response.cookies.set(`tg_viewer_auth_${subdomain}`, 'true', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
