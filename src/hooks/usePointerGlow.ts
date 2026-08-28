import { useEffect, useRef } from 'react';

type GlowElement = HTMLElement | null;

export const usePointerGlow = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element: GlowElement = ref.current;
    if (!element) return undefined;

    let frame = 0;
    const handleMove = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        element.style.setProperty('--mx', (((event.clientX - rect.left) / rect.width) * 100).toFixed(2));
        element.style.setProperty('--my', (((event.clientY - rect.top) / rect.height) * 100).toFixed(2));
      });
    };

    element.addEventListener('pointermove', handleMove);
    return () => {
      element.removeEventListener('pointermove', handleMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
};
