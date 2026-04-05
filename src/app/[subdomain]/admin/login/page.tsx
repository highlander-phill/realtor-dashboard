"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Turnstile from "@/components/Turnstile";

export default function AdminLoginPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  const error = searchParams.get("error");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setAuthError("Please complete the security check.");
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        turnstileToken,
        subdomain,
        redirect: false,
      });

      if (result?.error) {
        setAuthError("Invalid credentials.");
        setIsLoading(false);
      } else {
        router.push(`/${subdomain}/admin`);
      }
    } catch (err) {
       setAuthError("Auth error.");
       setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  if (!subdomain || subdomain === "admin") {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
           <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '10px' }}>ACCESS DENIED</h1>
           <p style={{ color: '#94a3b8' }}>Please visit your team URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ background: '#0f172a', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', background: '#2563eb', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0', letterSpacing: '-0.025em' }}>ADMIN LOGIN</h2>
            <p style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{subdomain} Console</p>
          </div>
          
          {authError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>{authError}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Email Address</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '14px 16px', borderRadius: '12px', background: '#020617', border: '1px solid #1e293b', color: 'white', fontSize: '16px', fontWeight: '600', outline: 'none' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: '14px 16px', borderRadius: '12px', background: '#020617', border: '1px solid #1e293b', color: 'white', fontSize: '16px', fontWeight: '600', outline: 'none' }}
                required
              />
            </div>
            
            <Turnstile onVerify={setTurnstileToken} />
            
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ padding: '16px', borderRadius: '12px', background: '#2563eb', color: 'white', border: 'none', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', marginTop: '8px' }}
            >
              {isLoading ? "VERIFYING..." : "SIGN IN"}
            </button>
          </form>

          <div style={{ position: 'relative', margin: '32px 0' }}>
            <div style={{ position: 'absolute', top: '50%', width: '100%', borderTop: '1px solid #1e293b' }}></div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span style={{ background: '#0f172a', padding: '0 12px', fontSize: '10px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Or continue with</span>
            </div>
          </div>

          <button 
            onClick={() => signIn("google", { callbackUrl: `/${subdomain}/admin` })}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'transparent', color: 'white', border: '1px solid #1e293b', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
