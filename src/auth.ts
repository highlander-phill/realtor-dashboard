import NextAuth from "next-auth"
import { D1Adapter } from "@auth/d1-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { verifyTurnstileToken } from "@/lib/utils"

export const { handlers, auth, signIn, signOut } = NextAuth((req) => {
  const { env } = getRequestContext() as any;
  return {
    adapter: D1Adapter(env.DB),
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
          if (user && user.password_hash === credentials.password) { // Using plain comparison for now, should be bcrypt
            return { id: user.id, email: user.email };
          }
          return null;
        },
      }),
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],
  }
})
