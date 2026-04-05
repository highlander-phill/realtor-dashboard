"use client";

import { useEffect, useRef, useState } from "react";

export default function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const renderTurnstile = () => {
      if (window.turnstile && containerRef.current) {
        try {
          window.turnstile.render(containerRef.current, {
            sitekey: "0x4AAAAAAC09M6PclLz1FMym",
            callback: (token: string) => {
              onVerify(token);
            },
          });
        } catch (e) {
          // Ignore "already rendered" errors
        }
      }
    };

    if (window.turnstile) {
      renderTurnstile();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = renderTurnstile;
      document.head.appendChild(script);
    }
  }, [isClient, onVerify]);

  if (!isClient) return null;

  return <div ref={containerRef} style={{ minHeight: '65px' }} />;
}

declare global {
  interface Window {
    turnstile: any;
  }
}
