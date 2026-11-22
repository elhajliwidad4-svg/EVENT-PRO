import { useEffect, useRef, useState } from 'react';

type CursorVariant = 'default' | 'interactive' | 'image' | 'text';

export function CustomCursor() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>('default');

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const finePointerMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncAvailability = () => {
      const enabled = finePointerMq.matches && !reducedMotionMq.matches;
      setIsEnabled(enabled);
      if (!enabled) {
        visibleRef.current = false;
        setIsVisible(false);
      }
    };

    syncAvailability();

    finePointerMq.addEventListener('change', syncAvailability);
    reducedMotionMq.addEventListener('change', syncAvailability);

    return () => {
      finePointerMq.removeEventListener('change', syncAvailability);
      reducedMotionMq.removeEventListener('change', syncAvailability);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const resolveVariant = (target: EventTarget | null): CursorVariant => {
      if (!(target instanceof Element)) return 'default';

      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        return 'text';
      }
      if (target.closest('button, a, [role="button"], [role="tab"], [role="slider"], summary')) {
        return 'interactive';
      }
      if (target.closest('img, picture, figure, [data-cursor="image"]')) {
        return 'image';
      }
      return 'default';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') {
        if (visibleRef.current) {
          visibleRef.current = false;
          setIsVisible(false);
        }
        return;
      }

      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;

      if (!visibleRef.current) {
        currentRef.current.x = e.clientX;
        currentRef.current.y = e.clientY;
        visibleRef.current = true;
        setIsVisible(true);
      }

      const nextVariant = resolveVariant(e.target);
      setVariant((prev) => (prev === nextVariant ? prev : nextVariant));
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        visibleRef.current = false;
        setIsVisible(false);
        return;
      }
      setIsPressed(true);
    };

    const handlePointerUp = () => {
      setIsPressed(false);
    };

    const handleTouchStart = () => {
      visibleRef.current = false;
      setIsVisible(false);
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      setIsVisible(false);
    };

    const animate = () => {
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;

      currentRef.current.x += dx * 0.22;
      currentRef.current.y += dy * 0.22;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0)`;
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  const ringClass =
    variant === 'image'
      ? 'w-14 h-14 border-[#C19F5E] bg-[#C19F5E]/15 shadow-[0_0_24px_rgba(193,159,94,0.3)]'
      : variant === 'interactive'
      ? 'w-12 h-12 border-[#8C6F38] bg-[#C19F5E]/18 shadow-[0_0_20px_rgba(140,111,56,0.25)]'
      : variant === 'text'
      ? 'w-5 h-5 border-[#C19F5E]/45 bg-transparent opacity-40'
      : 'w-7 h-7 border-[#C19F5E]/90 bg-[#C19F5E]/8 shadow-[0_0_12px_rgba(193,159,94,0.18)]';

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`fixed top-0 left-0 z-[9999] pointer-events-none print:hidden will-change-transform transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`relative -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] transition-[width,height,background-color,border-color,box-shadow,transform,opacity] duration-200 ease-out flex items-center justify-center ${ringClass} ${
          isPressed ? 'scale-90' : 'scale-100'
        }`}
      >
        {(variant === 'interactive' || variant === 'image') && (
          <span
            className={`rounded-full border border-[#E6C88A]/70 transition-all duration-200 ${
              variant === 'image' ? 'w-10 h-10' : 'w-8 h-8'
            }`}
          />
        )}
      </div>
    </div>
  );
}
