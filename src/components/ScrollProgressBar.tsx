import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const updateProgress = () => {
      rafRef.current = null;
      const el = barRef.current;
      if (!el) return;

      const docEl = document.documentElement;
      const scrollTop = window.scrollY || docEl.scrollTop || 0;
      const maxScroll = Math.max(0, docEl.scrollHeight - window.innerHeight);
      const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

      el.style.transform = `scaleX(${ratio})`;
      el.style.opacity = ratio > 0.002 ? '1' : '0';
    };

    const scheduleUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(document.documentElement);
    }

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (resizeObserver) resizeObserver.disconnect();
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none print:hidden"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left rtl:origin-right bg-gradient-to-r from-[#8C6F38] via-[#C19F5E] to-[#E6C88A] shadow-[0_0_8px_rgba(193,159,94,0.4)] transition-opacity duration-200 will-change-transform"
        style={{ transform: 'scaleX(0)', opacity: 0 }}
      />
    </div>
  );
}
