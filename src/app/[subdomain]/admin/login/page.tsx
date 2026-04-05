"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, Chrome, AlertCircle, ChevronLeft } from "lucide-react";
import Turnstile from "@/components/Turnstile";
import Link from "next/link";

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
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
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

  if (!isClient) return null;

  if (!subdomain || subdomain === "admin") {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }}>
           <h1>Access Denied</h1>
           <p>Please visit your team URL.</p>
           <Link href="/">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '1rem', border: '1px solid #1e293b' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Login ({subdomain})</h2>
          
          {authError && <div style={{ color: '#f87171', marginBottom: '1rem' }}>{authError}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#020617', border: '1px solid #1e293b', color: 'white' }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#020617', border: '1px solid #1e293b', color: 'white' }}
              required
            />
            <Turnstile onVerify={setTurnstileToken} />
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#2563eb', color: 'white', border: 'none', fontWeight: 'bold' }}
            >
              {isLoading ? "Loading..." : "Sign In"}
            </button>
          </form>

          <button 
            onClick={() => signIn("google", { callbackUrl: `/${subdomain}/admin` })}
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: '0.5rem', background: 'transparent', color: 'white', border: '1px solid #1e293b' }}
          >
            Google Login
          </button>
        </div>
      </div>
    </div>
  );
}
