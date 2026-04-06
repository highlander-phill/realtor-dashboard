import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { verifyTurnstileToken } from "@/lib/utils"
import { comparePasswords } from "@/lib/crypto"

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          const context = getRequestContext();
          const env = (context?.env || process.env || {}) as any;
          const db = env.DB;
          
          if (!db) {
            console.error("Auth: DB not found");
            return null;
          }
          
          const email = (credentials.email as string || "").toLowerCase();
          const password = credentials.password as string;
          
          const user = await db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").bind(email).first();
          if (user) {
            const isMatch = await comparePasswords(password, user.password_hash);
            if (isMatch) return { id: String(user.id), email: user.email, name: user.name };
          }
          return null;
        } catch (e) {
          console.error("Auth: Authorize error", e);
          return null;
        }
      },
    }),
    Google({
      clientId: (process.env.AUTH_GOOGLE_ID || "").replace(/['"\s]/g, ""),
      clientSecret: (process.env.AUTH_GOOGLE_SECRET || "").replace(/['"\s]/g, ""),
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id as string;
      return session;
    },
  },
  secret: (process.env.NEXTAUTH_SECRET || "idJbX2JhOzIHzYwd+J8IUPVmwSjY5Db071P5tqRnxcc=").replace(/['"\s]/g, ""),
})
