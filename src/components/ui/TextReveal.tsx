import { useEffect, useRef, useState } from 'react';

interface TextRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  tone?: 'light' | 'dark';
  immediate?: boolean;
  staggerMs?: number;
  className?: string;
}

export function TextReveal({
  text,
  as: Tag = 'h2',
  tone = 'light',
  immediate = false,
  staggerMs = 45,
  className = '',
}: TextRevealProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    if (immediate) {
      let innerFrame = 0;
      const outerFrame = window.requestAnimationFrame(() => {
        innerFrame = window.requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return () => {
        window.cancelAnimationFrame(outerFrame);
        if (innerFrame) window.cancelAnimationFrame(innerFrame);
      };
    }

    const el = headingRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -24px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate, text]);

  const words = text.trim().split(/\s+/).filter(Boolean);

  const gradientImage =
    tone === 'dark'
      ? 'linear-gradient(112deg, #FFFFFF 0%, #FAF8F4 34%, #E6C88A 50%, #C19F5E 62%, #FFFFFF 76%, #E6C88A 100%)'
      : 'linear-gradient(112deg, #1A1917 0%, #1A1917 34%, #C19F5E 50%, #8C6F38 62%, #1A1917 76%, #7A5E2B 100%)';

  return (
    <Tag ref={headingRef} aria-label={text} className={className}>
      <span aria-hidden="true">
        {words.map((word, idx) => (
          <span key={`${idx}-${word}`}>
            <span className="inline-block overflow-hidden align-bottom py-[0.08em] -my-[0.08em]">
              <span
                style={{
                  transitionDelay: isVisible ? `${Math.min(idx * staggerMs, 480)}ms` : '0ms',
                  backgroundImage: gradientImage,
                  backgroundSize: '260% 100%',
                  backgroundPosition: isVisible ? '100% 0' : '0% 0',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
                className={`inline-block transition-[transform,opacity,background-position] duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none will-change-transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[108%] opacity-0'
                }`}
              >
                {word}
              </span>
            </span>
            {idx < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
