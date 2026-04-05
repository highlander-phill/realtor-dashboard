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

    const initTurnstile = () => {
      if (window.turnstile && containerRef.current) {
        try {
          window.turnstile.render(containerRef.current, {
            sitekey: "0x4AAAAAAC09M6PclLz1FMym",
            callback: (token: string) => {
              onVerify(token);
            },
          });
        } catch (e) {
          console.warn("Turnstile render failed", e);
        }
      }
    };

    if (!window.turnstile) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = initTurnstile;
      document.head.appendChild(script);
    } else {
      initTurnstile();
    }
  }, [onVerify, isClient]);

  if (!isClient) return null;

  return <div ref={containerRef} className="min-h-[65px] flex justify-center" />;
}

declare global {
  interface Window {
    turnstile: any;
  }
}
