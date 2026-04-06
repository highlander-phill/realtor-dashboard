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

  console.log("Auth: Env keys available:", Object.keys(env));

  const sanitized = (val: any) => (val || "").toString().replace(/['"\s]/g, "");
  const secret = sanitized(env.NEXTAUTH_SECRET || env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET);
  
  const googleId = sanitized(env.AUTH_GOOGLE_ID || env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID);
  const googleSecret = sanitized(env.AUTH_GOOGLE_SECRET || env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET);

  return {
    debug: true,
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
          turnstileToken: { label: "Turnstile Token", type: "text" },
        },
        async authorize(credentials) {
          try {
            const db = env.DB || (process.env as any).DB;
            if (!db) {
              console.error("Auth: DB not found in environment");
              return null;
            }
            const token = (credentials.turnstileToken as string) || "";
            const turnstileSecret = sanitized(env.TURNSTILE_SECRET_KEY || env.CF_TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY || process.env.CF_TURNSTILE_SECRET_KEY);
            
            if (token) {
              const isValid = await verifyTurnstileToken(token, turnstileSecret);
              if (!isValid) {
                console.error("Auth: Turnstile verification failed");
                return null;
              }
            }
            
            const user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(credentials.email).first();
            if (user) {
              const isMatch = await comparePasswords(credentials.password as string, user.password_hash);
              if (isMatch) return { id: String(user.id), email: user.email };
            }
            return null;
          } catch (e) {
            console.error("Auth: Authorize error", e);
            return null;
          }
        },
      }),
      Google({
        clientId: googleId,
        clientSecret: googleSecret,
      }),
    ],
    secret: secret,
    trustHost: true,
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
  }
})
