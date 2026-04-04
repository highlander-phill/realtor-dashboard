import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface MasterEnv {
  SETTINGS?: {
    get: (key: string) => Promise<string | null>;
  };
  MASTER_PASSWORD?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as unknown as { env: MasterEnv };
    const body = await req.json();
    const { password } = body;

    let correctPassword = "4WeeStella$"; // Fallback

    if (env.SETTINGS) {
      const kvPassword = await env.SETTINGS.get("MASTER_PASSWORD");
      if (kvPassword) {
        correctPassword = kvPassword;
      }
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
