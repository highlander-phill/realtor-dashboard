import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const context = getRequestContext();
    const env = (context?.env || process.env || {}) as any;
    const { userName, userEmail, message } = await req.json();

    const apiKey = env.SMTP2GO_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "SMTP2GO API Key not configured" }, { status: 500 });

    const response = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        sender: "supportrequest@team-goals.com",
        recipients: ["phill@phillsimpson.com"],
        reply_to: userEmail,
        subject: `[Team-Goals] New Contact from ${userName}`,
        html_body: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Support Request</h2>
            <p><strong>From:</strong> ${userName} (${userEmail})</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `
      }),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json(data, { status: response.status });

    return NextResponse.json(data);
  } catch (error) {
    console.error("SMTP2GO error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
