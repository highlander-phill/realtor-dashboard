import NextAuth from "next-auth"
import { D1Adapter } from "@auth/d1-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { verifyTurnstileToken } from "@/lib/utils"
import { comparePasswords } from "@/lib/crypto"

export const { handlers, auth, signIn, signOut } = NextAuth((req) => {
  const context = getRequestContext();
  const env = (context?.env || {}) as any;
  return {
    adapter: env.DB ? D1Adapter(env.DB) : undefined,
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
          turnstileToken: { label: "Turnstile Token", type: "text" },
        },
        async authorize(credentials) {
          const db = env.DB;
          const token = credentials.turnstileToken as string;
          const isValid = await verifyTurnstileToken(token, env.TURNSTILE_SECRET_KEY);
          if (!isValid) return null;
          
          const user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(credentials.email).first();
          if (user) {
            const isMatch = await comparePasswords(credentials.password as string, user.password_hash);
            if (isMatch) return { id: user.id, email: user.email };
          }
          return null;
        },
      }),
      Google({
        clientId: (env.AUTH_GOOGLE_ID || process.env.AUTH_GOOGLE_ID || env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "").replace(/['"]/g, "").trim(),
        clientSecret: (env.AUTH_GOOGLE_SECRET || process.env.AUTH_GOOGLE_SECRET || env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || "").replace(/['"]/g, "").trim(),
      }),
    ],
  }
})
