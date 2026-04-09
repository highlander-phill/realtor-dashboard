import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { hashPassword } from "@/lib/crypto";

export const runtime = "edge";

// Basic HMAC-based token (simplified for this environment)
async function generateToken(email: string, secret: string) {
  const expiry = Date.now() + 3600000; // 1 hour
  const data = `${email}:${expiry}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const sigHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
  return btoa(`${data}:${sigHex}`);
}

async function verifyToken(token: string, secret: string) {
  try {
    const decoded = atob(token);
    const [email, expiry, sigHex] = decoded.split(':');
    if (Date.now() > parseInt(expiry)) return null;
    const data = `${email}:${expiry}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
    const expectedSigHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (sigHex !== expectedSigHex) return null;
    return email;
  } catch (e) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext() as any;
    const db = env.DB;
    const { action, email, token, password, subdomain } = await req.json();
    const secret = env.NEXTAUTH_SECRET || "fallback-secret";

    if (action === 'request') {
      const user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      if (!user) return NextResponse.json({ message: "If that email exists, a reset link has been sent." });

      const resetToken = await generateToken(email, secret);
      const resetLink = `https://${subdomain}.team-goals.com/admin/reset-password?token=${encodeURIComponent(resetToken)}`;

      // Send email via SMTP2GO (calling the internal route or fetch directly)
      const emailRes = await fetch("https://api.smtp2go.com/v3/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: env.SMTP2GO_API_KEY,
          sender: "supportrequest@team-goals.com",
          recipients: [email],
          subject: "[Team-Goals] Password Reset Request",
          html_body: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #2563eb;">Password Reset</h2>
              <p>You requested a password reset for your TeamGoals account.</p>
              <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
              <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `
        })
      });

      return NextResponse.json({ success: true, message: "If that email exists, a reset link has been sent." });
    }

    if (action === 'reset') {
      const verifiedEmail = await verifyToken(token, secret);
      if (!verifiedEmail) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

      const hashedPassword = await hashPassword(password);
      await db.prepare("UPDATE users SET password_hash = ? WHERE email = ?").bind(hashedPassword, verifiedEmail).run();
      
      // Also update tenant admin password if this is the admin
      await db.prepare("UPDATE tenants SET admin_password_hash = ? WHERE id IN (SELECT tenant_id FROM users WHERE email = ?)").bind(hashedPassword, verifiedEmail).run();

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
