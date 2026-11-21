import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  target: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
}

export function AnimatedCounter({
  target,
  decimals = 0,
  suffix = '',
  prefix = '',
  durationMs = 900,
}: AnimatedCounterProps) {
  const [value, setValue] = useState(target);
  const hasAnimated = useRef(false);
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(target * eased);
          if (progress < 1) requestAnimationFrame(tick);
          else setValue(target);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.2 }
    );

    if (elRef.current) observer.observe(elRef.current);
    return () => observer.disconnect();
  }, [target, durationMs]);

  return (
    <span ref={elRef} className="tabular-nums">
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
