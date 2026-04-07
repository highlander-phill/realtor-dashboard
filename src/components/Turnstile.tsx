"use client";

import { useEffect, useRef, useState } from "react";

export default function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    let widgetId: string | null = null;

    let interval: any = null;

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetId) {
        try {
          widgetId = window.turnstile.render(containerRef.current, {
            sitekey: "0x4AAAAAAC09M6PclLz1FMym",
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            callback: (token: string) => {
              onVerify(token);
            },
          });
        } catch (e) {
          // Silent error if already rendered
        }
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.getElementById("cf-turnstile-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "cf-turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = renderWidget;
        document.head.appendChild(script);
      } else {
        interval = setInterval(() => {
          if (window.turnstile) {
            renderWidget();
            clearInterval(interval);
          }
        }, 100);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch (e) {}
      }
    };
  }, [isMounted, onVerify]);

  if (!isMounted) return <div style={{ minHeight: '65px' }} />;

  return (
    <div 
      ref={containerRef} 
      style={{ 
        minHeight: '65px', 
        display: 'flex', 
        justifyContent: 'center',
        margin: '1rem 0'
      }} 
    />
  );
}

declare global {
  interface Window {
    turnstile: any;
  }
}
