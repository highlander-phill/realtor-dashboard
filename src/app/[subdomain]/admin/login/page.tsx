"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Turnstile from "@/components/Turnstile";

export default function AdminLoginPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  
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

  if (!isMounted) return <div style={{ minHeight: '100vh', background: '#020617' }}></div>;

  if (!subdomain || subdomain === "admin") {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
           <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>ACCESS DENIED</h1>
           <p style={{ color: '#94a3b8' }}>Please visit your team URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ background: '#0f172a', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>ADMIN LOGIN</h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0', textTransform: 'uppercase' }}>{subdomain} Console v2.2.15</p>
          </div>
          
          {authError && <div style={{ color: '#f87171', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #ef4444' }}>{authError}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '14px', borderRadius: '12px', background: '#020617', border: '1px solid #1e293b', color: 'white', fontSize: '16px' }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '14px', borderRadius: '12px', background: '#020617', border: '1px solid #1e293b', color: 'white', fontSize: '16px' }}
              required
            />
            
            <Turnstile onVerify={setTurnstileToken} />
            
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ padding: '16px', borderRadius: '12px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isLoading ? "VERIFYING..." : "SIGN IN"}
            </button>
          </form>

          <div style={{ textAlign: 'center', margin: '24px 0', borderTop: '1px solid #1e293b', paddingTop: '24px' }}>
            <button 
              onClick={() => signIn("google", { callbackUrl: `/${subdomain}/admin` })}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'white', color: '#0f172a', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Google Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
