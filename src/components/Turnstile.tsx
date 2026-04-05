"use client";

import { useEffect, useRef } from "react";

export default function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          onVerify(token);
        },
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [onVerify]);

  return <div ref={containerRef} />;
}

declare global {
  interface Window {
    turnstile: any;
  }
}
