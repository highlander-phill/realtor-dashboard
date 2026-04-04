import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface MasterEnv {
  SETTINGS: KVNamespace;
}

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as unknown as { env: MasterEnv };
    const body = await req.json();
    const { password } = body;

    if (env.SETTINGS) {
      const lockoutTime = await env.SETTINGS.get("MASTER_LOCKOUT");
      if (lockoutTime && parseInt(lockoutTime) > Date.now()) {
        const remaining = Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000);
        return NextResponse.json({ success: false, error: `Too many attempts. Try again in ${remaining}s.` }, { status: 429 });
      }
    }

    let correctPassword = "4WeeStella$"; // Fallback

    if (env.SETTINGS) {
      const kvPassword = await env.SETTINGS.get("MASTER_PASSWORD");
      if (kvPassword) {
        correctPassword = kvPassword;
      }
    }

    if (password === correctPassword) {
      if (env.SETTINGS) await env.SETTINGS.delete("MASTER_FAIL_COUNT");
      return NextResponse.json({ success: true });
    } else {
      if (env.SETTINGS) {
        const currentFails = parseInt(await env.SETTINGS.get("MASTER_FAIL_COUNT") || "0") + 1;
        await env.SETTINGS.put("MASTER_FAIL_COUNT", currentFails.toString(), { expirationTtl: 3600 });
        
        if (currentFails >= 5) {
          const nextLockout = Date.now() + 30000; // 30 second lockout
          await env.SETTINGS.put("MASTER_LOCKOUT", nextLockout.toString(), { expirationTtl: 60 });
        }
      }
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
