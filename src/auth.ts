import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { verifyTurnstileToken } from "@/lib/utils"
import { comparePasswords } from "@/lib/crypto"

const getSanitizedEnv = (key: string) => {
  const val = process.env[key] || "";
  return val.replace(/['"\s]/g, "");
};

const authConfig = {
  debug: true,
  trustHost: true,
  session: { strategy: "jwt" as const },
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
          
          const email = (credentials.email as string || "").toLowerCase().trim();
          const password = credentials.password as string;
          
          const user = await db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").bind(email).first();
          if (user) {
            const isMatch = await comparePasswords(password, user.password_hash);
            if (isMatch) return { id: String(user.id), email: user.email, name: user.name || user.email.split('@')[0] };
          }
          
          // Check if this is the tenant admin
          const tenant = await db.prepare("SELECT * FROM tenants WHERE admin_password_hash IS NOT NULL").bind().all();
          // We don't have email in tenants, but maybe we can match by subdomain?
          // Since we don't have subdomain in credentials, we can't easily match here 
          // UNLESS we use the fallback of checking agents.
          
          const agent = await db.prepare("SELECT * FROM agents WHERE LOWER(email) = ?").bind(email).first();
          if (agent) {
             // If agent has a password hash, check it
             // For now, let's assume they might be using the tenant password if they are the primary agent
             const tenantOfAgent = await db.prepare("SELECT * FROM tenants WHERE id = ?").bind(agent.tenant_id).first();
             if (tenantOfAgent && tenantOfAgent.admin_password_hash) {
                const isMatch = password === tenantOfAgent.admin_password_hash || await comparePasswords(password, tenantOfAgent.admin_password_hash);
                if (isMatch) return { id: String(agent.id), email: agent.email || email, name: agent.name };
             }
          }

          return null;
        } catch (e) {
          console.error("Auth: Authorize error", e);
          return null;
        }
      },
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
  secret: getSanitizedEnv("NEXTAUTH_SECRET") || getSanitizedEnv("AUTH_SECRET") || "idJbX2JhOzIHzYwd+J8IUPVmwSjY5Db071P5tqRnxcc=",
};

// Add Google provider only if credentials are provided to avoid configuration errors
const googleId = getSanitizedEnv("AUTH_GOOGLE_ID") || getSanitizedEnv("GOOGLE_CLIENT_ID");
const googleSecret = getSanitizedEnv("AUTH_GOOGLE_SECRET") || getSanitizedEnv("GOOGLE_CLIENT_SECRET");

if (googleId && googleSecret) {
  authConfig.providers.push(
    Google({
      clientId: googleId,
      clientSecret: googleSecret,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
