import NextAuth from "next-auth"
import { D1Adapter } from "@auth/d1-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { verifyTurnstileToken } from "@/lib/utils"
import { comparePasswords } from "@/lib/crypto"

export const { handlers, auth, signIn, signOut } = NextAuth((req) => {
  let context: any;
  try {
    context = getRequestContext();
  } catch (e) {
    console.error("Auth: Failed to get request context", e);
  }
  const env = (context?.env || process.env || {}) as any;

  const sanitized = (val: any) => (val || "").toString().replace(/['"\s]/g, "");

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
          if (!db) {
            console.error("Auth: DB not found in environment");
            return null;
          }
          const token = credentials.turnstileToken as string;
          const turnstileSecret = sanitized(env.TURNSTILE_SECRET_KEY || env.CF_TURNSTILE_SECRET_KEY);
          
          const isValid = await verifyTurnstileToken(token, turnstileSecret);
          if (!isValid) {
            console.error("Auth: Turnstile verification failed");
            return null;
          }
          
          const user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(credentials.email).first();
          if (user) {
            const isMatch = await comparePasswords(credentials.password as string, user.password_hash);
            if (isMatch) return { id: user.id, email: user.email };
          }
          return null;
        },
      }),
      Google({
        clientId: sanitized(env.AUTH_GOOGLE_ID || env.GOOGLE_CLIENT_ID),
        clientSecret: sanitized(env.AUTH_GOOGLE_SECRET || env.GOOGLE_CLIENT_SECRET),
      }),
    ],
    secret: sanitized(env.NEXTAUTH_SECRET || env.AUTH_SECRET),
    trustHost: true,
    callbacks: {
      async session({ session, user, token }) {
        if (token?.sub && session.user) {
          session.user.id = token.sub;
        }
        return session;
      },
    },
  }
})
