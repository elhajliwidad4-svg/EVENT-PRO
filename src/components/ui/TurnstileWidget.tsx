import { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; theme?: string }
      ) => string;
      remove: (id: string) => void;
    };
  }
}

export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(() => {
    if (!siteKey) {
      onVerify('dev-preview-bypass');
      return;
    }

    let widgetId: string | null = null;
    const renderWidget = () => {
      if (containerRef.current && window.turnstile) {
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token) => onVerify(token),
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existing = document.getElementById('cf-turnstile-script');
      if (!existing) {
        const script = document.createElement('script');
        script.id = 'cf-turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = renderWidget;
        document.head.appendChild(script);
      } else {
        existing.addEventListener('load', renderWidget);
      }
    }

    return () => {
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [siteKey, onVerify]);

  if (!siteKey) {
    return (
      <p className="text-xs text-[#5C574F]">
        Protection anti-spam Cloudflare Turnstile prête (activez <span className="font-mono-tabular">VITE_TURNSTILE_SITE_KEY</span> en production).
      </p>
    );
  }

  return <div ref={containerRef} className="my-2" />;
}
