import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const context = getRequestContext();
    const env = (context?.env || process.env || {}) as any;
    const body = await req.json();
    const { userName, userEmail, message, type = 'support', tenantName, subdomain } = body;

    const apiKey = env.SMTP2GO_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "SMTP2GO API Key not configured" }, { status: 500 });

    let subject = `[Team-Goals] New Contact from ${userName}`;
    let html_body = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Support Request</h2>
        <p><strong>From:</strong> ${userName} (${userEmail})</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `;

    if (type === 'signup_alert') {
      subject = `[Team-Goals] 🚀 New Signup: ${tenantName}`;
      html_body = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #22c55e;">New Trial Signup!</h2>
          <p><strong>Company:</strong> ${tenantName}</p>
          <p><strong>Admin Email:</strong> ${userEmail}</p>
          <p><strong>Subdomain:</strong> ${subdomain}</p>
          <p><strong>URL:</strong> <a href="https://${subdomain}.team-goals.com">https://${subdomain}.team-goals.com</a></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p>A new customer has just completed onboarding and started their 30-day trial.</p>
        </div>
      `;
    }

    const response = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        sender: "supportrequest@team-goals.com",
        recipients: ["phill@phillsimpson.com"],
        reply_to: userEmail || "support@team-goals.com",
        subject: subject,
        html_body: html_body
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
