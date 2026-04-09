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
    const context = getRequestContext();
    const env = (context?.env || process.env || {}) as any;
    const db = env.DB;
    const { action, email, token, password, subdomain } = await req.json();
    const secret = env.NEXTAUTH_SECRET || "fallback-secret";

    if (action === 'request') {
      const user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      if (!user) return NextResponse.json({ message: "If that email exists, instructions have been sent." });

      // Generate a temporary 8-character password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await hashPassword(tempPassword);

      // Update both user and tenant (if admin)
      await db.prepare("UPDATE users SET password_hash = ? WHERE email = ?").bind(hashedPassword, email).run();
      await db.prepare("UPDATE tenants SET admin_password_hash = ? WHERE id = ?").bind(hashedPassword, user.tenant_id).run();

      // Send email via SMTP2GO
      if (env.SMTP2GO_API_KEY) {
        await fetch("https://api.smtp2go.com/v3/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: env.SMTP2GO_API_KEY,
            sender: "noreply@team-goals.com",
            recipients: [email],
            subject: "[Team-Goals] Your Temporary Password",
            html_body: `
              <div style="font-family: sans-serif; padding: 40px; color: #333; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                  <h2 style="color: #2563eb; margin-top: 0;">Password Reset</h2>
                  <p>Your TeamGoals password has been reset to a temporary one.</p>
                  <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center;">
                    <span style="font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${tempPassword}</span>
                  </div>
                  <p>Please use this password to sign in, and then immediately update it from your <strong>System Settings</strong> in the Admin Console.</p>
                  <a href="https://${subdomain}.team-goals.com/admin/login" style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px;">Sign In Now</a>
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                  <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">If you didn't request this change, please contact support immediately.</p>
                </div>
              </div>
            `
          })
        });
      }

      return NextResponse.json({ success: true, message: "A temporary password has been sent to your email." });
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
