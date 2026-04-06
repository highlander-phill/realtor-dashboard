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

    const renderWidget = () => {
      // Small delay to ensure container is ready in DOM
      setTimeout(() => {
        if (window.turnstile && containerRef.current) {
          try {
            window.turnstile.render(containerRef.current, {
              sitekey: "0x4AAAAAAC09M6PclLz1FMym",
              callback: (token: string) => {
                onVerify(token);
              },
            });
          } catch (e) {
            // Already rendered
          }
        }
      }, 100);
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    }
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
