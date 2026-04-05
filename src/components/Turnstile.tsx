"use client";

import { useEffect, useRef, useState } from "react";

export default function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let script = document.querySelector('script[src*="turnstile"]') as HTMLScriptElement;
    
    const initTurnstile = () => {
      if (window.turnstile && containerRef.current) {
        try {
          window.turnstile.render(containerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAC09M6PclLz1FMym",
            callback: (token: string) => {
              onVerify(token);
            },
          });
        } catch (e) {
          console.warn("Turnstile render attempt failed, likely already rendered", e);
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = initTurnstile;
    } else {
      if (window.turnstile) {
        initTurnstile();
      } else {
        script.addEventListener('load', initTurnstile);
      }
    }

    return () => {
      // Don't remove the script as it might be needed by other components,
      // but we can clear the container if needed.
    };
  }, [onVerify, isClient]);

  if (!isClient) return <div className="h-16 w-full bg-slate-800/20 animate-pulse rounded-xl" />;

  return <div ref={containerRef} className="min-h-[65px] flex justify-center" />;
}

declare global {
  interface Window {
    turnstile: any;
  }
}
