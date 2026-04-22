import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/utils";

export const runtime = "edge";

interface MasterEnv {
  SETTINGS: KVNamespace;
}

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as unknown as { env: MasterEnv };
    const body = await req.json();
    const { password, turnstileToken } = body;

    // 1. Turnstile Verification (Server-Side)
    const turnstileSecretKey = "0x4AAAAAAC09M5-b9P1MQeSSwKQ8PPWQIMA"; // Directly using the provided secret key
    const turnstileVerification = await verifyTurnstileToken(turnstileSecretKey, turnstileToken);
    
    if (!turnstileVerification.success) {
      console.warn("Turnstile verification failed:", turnstileVerification["error-codes"]);
      return NextResponse.json({ success: false, error: "Turnstile verification failed." }, { status: 403 });
    }

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
      if (env.SETTINGS) {
        await env.SETTINGS.delete("MASTER_FAIL_COUNT");
        await env.SETTINGS.delete("MASTER_LOCKOUT");
      }
      return NextResponse.json({ success: true });
    } else {
      if (env.SETTINGS) {
        const currentFails = parseInt(await env.SETTINGS.get("MASTER_FAIL_COUNT") || "0") + 1;
        await env.SETTINGS.put("MASTER_FAIL_COUNT", currentFails.toString(), { expirationTtl: 3600 });
        
        if (currentFails >= 3) {
          const nextLockout = Date.now() + 60000; // 60 second lockout after 3 failures
          await env.SETTINGS.put("MASTER_LOCKOUT", nextLockout.toString(), { expirationTtl: 120 });
        }
      }
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
