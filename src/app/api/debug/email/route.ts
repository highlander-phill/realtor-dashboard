import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const context = getRequestContext();
    const env = (context?.env || process.env || {}) as any;
    const apiKey = env.SMTP2GO_API_KEY || "api-C977C946518E4C1CA76769BB88BE55F4";
    
    const testEmail = req.nextUrl.searchParams.get("email") || "phill@phillsimpson.com";

    const payload = {
      api_key: apiKey,
      sender: "support@team-goals.com",
      recipients: [testEmail],
      subject: "[Team-Goals] Diagnostic Test",
      text_body: "This is a diagnostic test of the SMTP2GO API integration.",
      html_body: "<h1>Diagnostic Test</h1><p>This is a diagnostic test of the SMTP2GO API integration.</p>"
    };

    const response = await fetch("https://us-api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      smtp2go_response: data,
      config_used: {
        sender: "support@team-goals.com",
        recipient: testEmail,
        using_fallback_key: !env.SMTP2GO_API_KEY
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
