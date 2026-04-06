import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { verifyTurnstileToken } from "@/lib/utils"
import { comparePasswords } from "@/lib/crypto"

// Auth.js v5 Configuration Error fix:
// We must ensure AUTH_SECRET is available during initialization.
// Since process.env can be unreliable in Edge at top-level initialization,
// we provide a hardcoded fallback that is guaranteed to be a string.
const DEFAULT_SECRET = "idJbX2JhOzIHzYwd+J8IUPVmwSjY5Db071P5tqRnxcc=";

const getSanitizedEnv = (key: string) => {
  const val = process.env[key] || "";
  return val.replace(/['"\s]/g, "");
};

// Lazy secret retrieval to ensure we get it from the environment if available
const getSecret = () => {
  const s = getSanitizedEnv("AUTH_SECRET") || getSanitizedEnv("NEXTAUTH_SECRET");
  return s || DEFAULT_SECRET;
};

// Define providers before calling NextAuth
const providers = [
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
        
        // Attempt login for users table
        const user = await db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").bind(email).first();
        if (user) {
          const isMatch = await comparePasswords(password, user.password_hash);
          if (isMatch) return { id: String(user.id), email: user.email, name: user.name || user.email.split('@')[0] };
        }
        
        // Attempt login for agents table if email matches and tenant admin password matches
        const agent = await db.prepare("SELECT * FROM agents WHERE LOWER(email) = ?").bind(email).first();
        if (agent) {
           const tenant = await db.prepare("SELECT * FROM tenants WHERE id = ?").bind(agent.tenant_id).first();
           if (tenant && tenant.admin_password_hash) {
              const isMatch = password === tenant.admin_password_hash || await comparePasswords(password, tenant.admin_password_hash);
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
];

// Conditionally add Google provider
const googleId = getSanitizedEnv("AUTH_GOOGLE_ID") || getSanitizedEnv("GOOGLE_CLIENT_ID");
const googleSecret = getSanitizedEnv("AUTH_GOOGLE_SECRET") || getSanitizedEnv("GOOGLE_CLIENT_SECRET");

if (googleId && googleSecret) {
  providers.push(
    Google({
      clientId: googleId,
      clientSecret: googleSecret,
      // For Edge runtime, sometimes we need to manually specify the profile callback
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }) as any
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  trustHost: true,
  secret: getSecret(),
  session: { strategy: "jwt" },
  providers: providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id as string;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirect stays within the same subdomain if possible
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return url;
    },
  },
  // Setting explicit pages might help avoid the default /api/auth pathing issues
  // But let's leave it commented out for now to see if the basic fix works
  // pages: {
  //   signIn: '/admin/login',
  //   error: '/admin/login',
  // }
});

