import { useEffect } from 'react';

/**
 * Reveal-on-scroll for any [data-reveal] element inside the given ref.
 * Self-contained so section components work on pages with or without
 * a page-level IntersectionObserver.
 */
export function useSectionReveal(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const els = root.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'none';
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ref]);
}
