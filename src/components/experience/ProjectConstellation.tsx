import { useEffect, useMemo, useRef } from 'react';
import './experience.css';

export interface ProjectConstellationProject {
  slug: string;
  title?: string | { readonly tr: string; readonly en: string };
}

export interface ProjectConstellationProps {
  projects?: readonly ProjectConstellationProject[];
  motionEnabled?: boolean;
  nodeCount?: number;
  seed?: number | string;
  palette?: readonly string[];
  className?: string;
}

interface ConstellationNode {
  x: number;
  y: number;
  radius: number;
  phase: number;
  drift: number;
  color: number;
}

const DEFAULT_PALETTE = [
  'rgba(126, 231, 196, 0.78)',
  'rgba(148, 163, 255, 0.62)',
  'rgba(243, 182, 111, 0.72)',
] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function hash(value: string): number {
  let output = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    output ^= value.charCodeAt(index);
    output = Math.imul(output, 16777619);
  }
  return output >>> 0;
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createNodes(count: number, seed: number, paletteLength: number): ConstellationNode[] {
  const random = createRandom(seed);
  return Array.from({ length: count }, (_, index) => ({
    x: 0.06 + random() * 0.88,
    y: 0.08 + random() * 0.84,
    radius: index < Math.ceil(count / 5) ? 2.1 + random() * 1.8 : 0.9 + random() * 1.5,
    phase: random() * Math.PI * 2,
    drift: 0.35 + random() * 0.65,
    color: Math.floor(random() * paletteLength),
  }));
}

function safeCanvasColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const candidate = value.trim();
  const isHex = /^#[\da-f]{3,8}$/i.test(candidate);
  const isFunction = /^(?:color|hsl|hsla|lab|lch|oklab|oklch|rgb|rgba)\([\da-z.,%+\-/\s]+\)$/i.test(
    candidate,
  );
  const isNamed = /^[a-z]{3,24}$/i.test(candidate);
  return isHex || isFunction || isNamed ? candidate : fallback;
}

export function ProjectConstellation({
  projects = [],
  motionEnabled = true,
  nodeCount = 18,
  seed = 'ackaraca',
  palette = DEFAULT_PALETTE,
  className = '',
}: ProjectConstellationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const projectKey = useMemo(() => projects.map((project) => project.slug).join('|'), [projects]);
  const paletteKey = useMemo(() => palette.join('|'), [palette]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!container || !canvas || !context) return undefined;

    const paletteValues = paletteKey.split('|');
    const resolvedPalette = DEFAULT_PALETTE.map((fallback, index) =>
      safeCanvasColor(paletteValues[index], fallback),
    );
    const requestedCount = projects.length > 0 ? Math.max(projects.length * 2, projects.length + 5) : nodeCount;
    const count = clamp(Math.round(requestedCount), 6, 32);
    const seedValue = hash(`${String(seed)}|${projectKey}|${count}`);
    const nodes = createNodes(count, seedValue, resolvedPalette.length);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let width = 0;
    let height = 0;
    let frameId: number | null = null;
    let inViewport = true;
    let pageVisible = !document.hidden;
    let reducedMotion = motionQuery.matches;
    let disposed = false;
    let pointerX = 0;
    let pointerY = 0;
    let pointerStrength = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let targetPointerStrength = 0;

    const isAnimated = () => motionEnabled && !reducedMotion;

    const draw = (timestamp = 0, animate = false) => {
      if (width <= 0 || height <= 0) return;

      if (animate) {
        pointerX += (targetPointerX - pointerX) * 0.035;
        pointerY += (targetPointerY - pointerY) * 0.035;
        pointerStrength += (targetPointerStrength - pointerStrength) * 0.045;
      } else {
        pointerX = 0;
        pointerY = 0;
        pointerStrength = 0;
      }

      context.clearRect(0, 0, width, height);
      context.save();
      const positions = nodes.map((node) => {
        const time = animate ? timestamp * 0.00018 * node.drift : 0;
        const driftX = Math.cos(node.phase + time) * Math.min(width, height) * 0.008;
        const driftY = Math.sin(node.phase * 1.3 + time) * Math.min(width, height) * 0.006;
        const influence = pointerStrength * (8 + node.radius * 2);

        return {
          x: node.x * width + driftX + pointerX * influence * (0.65 + node.y * 0.35),
          y: node.y * height + driftY + pointerY * influence * (0.65 + node.x * 0.35),
        };
      });

      const connectionDistance = Math.min(180, Math.max(92, Math.min(width, height) * 0.22));
      context.lineWidth = 0.7;
      for (let first = 0; first < positions.length; first += 1) {
        const from = positions[first];
        if (!from) continue;
        for (let second = first + 1; second < positions.length; second += 1) {
          const to = positions[second];
          if (!to) continue;
          const distance = Math.hypot(from.x - to.x, from.y - to.y);
          if (distance > connectionDistance) continue;

          context.globalAlpha = (1 - distance / connectionDistance) * 0.28;
          context.strokeStyle = resolvedPalette[(first + second) % resolvedPalette.length] ?? DEFAULT_PALETTE[0];
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
          context.stroke();
        }
      }

      nodes.forEach((node, index) => {
        const point = positions[index];
        if (!point) return;
        const pulse = animate ? Math.sin(timestamp * 0.0014 + node.phase) * 0.16 + 0.84 : 0.84;
        context.globalAlpha = pulse;
        context.fillStyle = resolvedPalette[node.color] ?? DEFAULT_PALETTE[0];
        context.beginPath();
        context.arc(point.x, point.y, node.radius, 0, Math.PI * 2);
        context.fill();

        if (node.radius > 2) {
          context.globalAlpha = 0.14;
          context.beginPath();
          context.arc(point.x, point.y, node.radius * 3.4, 0, Math.PI * 2);
          context.fill();
        }
      });
      context.restore();
    };

    const cancelLoop = () => {
      if (frameId === null) return;
      window.cancelAnimationFrame(frameId);
      frameId = null;
    };

    const scheduleLoop = () => {
      if (disposed || frameId !== null || !isAnimated() || !inViewport || !pageVisible) return;
      frameId = window.requestAnimationFrame((timestamp) => {
        frameId = null;
        if (disposed || !isAnimated() || !inViewport || !pageVisible) return;
        draw(timestamp, true);
        scheduleLoop();
      });
    };

    const synchronizeLoop = () => {
      if (isAnimated() && inViewport && pageVisible) {
        scheduleLoop();
      } else {
        cancelLoop();
      }
    };

    const resize = (nextWidth: number, nextHeight: number) => {
      width = Math.max(1, Math.round(nextWidth));
      height = Math.max(1, Math.round(nextHeight));
      const ratio = clamp(window.devicePixelRatio || 1, 1, 1.5);

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(0, false);
      synchronizeLoop();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isAnimated()) return;
      const bounds = canvas.getBoundingClientRect();
      const padding = 72;
      const isNear =
        event.clientX >= bounds.left - padding &&
        event.clientX <= bounds.right + padding &&
        event.clientY >= bounds.top - padding &&
        event.clientY <= bounds.bottom + padding;

      if (!isNear || bounds.width <= 0 || bounds.height <= 0) {
        targetPointerStrength = 0;
        return;
      }

      targetPointerX = clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 2, -1, 1);
      targetPointerY = clamp(((event.clientY - bounds.top) / bounds.height - 0.5) * 2, -1, 1);
      targetPointerStrength = 0.65;
    };

    const handleVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) draw(0, false);
      synchronizeLoop();
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      draw(0, false);
      synchronizeLoop();
    };

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const bounds = entry.contentRect;
            resize(bounds.width, bounds.height);
          });

    const intersectionObserver =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              if (!entry) return;
              inViewport = entry.isIntersecting && entry.intersectionRatio > 0;
              if (inViewport) draw(0, false);
              synchronizeLoop();
            },
            { rootMargin: '120px 0px', threshold: 0.01 },
          );

    resizeObserver?.observe(container);
    intersectionObserver?.observe(canvas);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    motionQuery.addEventListener('change', handleMotionPreference);

    const initialBounds = container.getBoundingClientRect();
    resize(initialBounds.width || canvas.clientWidth || 1, initialBounds.height || canvas.clientHeight || 1);

    return () => {
      disposed = true;
      cancelLoop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      motionQuery.removeEventListener('change', handleMotionPreference);
    };
  }, [motionEnabled, nodeCount, paletteKey, projectKey, projects.length, seed]);

  return (
    <div
      className={['experience-project-constellation', className].filter(Boolean).join(' ')}
      data-motion={motionEnabled ? 'enabled' : 'disabled'}
      ref={containerRef}
    >
      <canvas
        aria-hidden="true"
        className="experience-project-constellation-canvas"
        ref={canvasRef}
        style={{ display: 'block', pointerEvents: 'none' }}
      />
    </div>
  );
}

export default ProjectConstellation;
