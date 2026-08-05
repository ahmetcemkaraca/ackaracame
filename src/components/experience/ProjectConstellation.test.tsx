import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectConstellation } from './ProjectConstellation';

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];

  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();

  constructor(private readonly callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.push(this);
  }

  trigger(width: number, height: number) {
    this.callback(
      [
        {
          contentRect: {
            bottom: height,
            height,
            left: 0,
            right: width,
            top: 0,
            width,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          },
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }
}

class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = [];

  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  readonly takeRecords = vi.fn(() => []);
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0.01];

  constructor(private readonly callback: IntersectionObserverCallback) {
    IntersectionObserverMock.instances.push(this);
  }

  trigger(isIntersecting: boolean) {
    this.callback(
      [
        {
          intersectionRatio: isIntersecting ? 1 : 0,
          isIntersecting,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

function createContextMock() {
  return {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    lineTo: vi.fn(),
    lineWidth: 1,
    moveTo: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: '',
  };
}

function rect(width = 600, height = 400): DOMRect {
  return {
    bottom: height,
    height,
    left: 0,
    right: width,
    top: 0,
    width,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
}

describe('ProjectConstellation', () => {
  const frameCallbacks = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  let context: ReturnType<typeof createContextMock>;
  let documentHidden = false;

  beforeEach(() => {
    ResizeObserverMock.instances = [];
    IntersectionObserverMock.instances = [];
    frameCallbacks.clear();
    frameId = 0;
    documentHidden = false;
    context = createContextMock();

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () => context as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => rect());
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameId += 1;
      frameCallbacks.set(frameId, callback);
      return frameId;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      frameCallbacks.delete(id);
    });
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 3 });
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => documentHidden,
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1 });
    Reflect.deleteProperty(document, 'hidden');
  });

  it('caps DPR, draws a static frame, and keeps the canvas non-interactive', () => {
    const { container, unmount } = render(
      <ProjectConstellation motionEnabled={false} projects={[{ slug: 'mailcrush' }]} />,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(canvas).toHaveStyle({ pointerEvents: 'none' });
    expect(canvas?.width).toBe(900);
    expect(canvas?.height).toBe(600);
    expect(context.setTransform).toHaveBeenCalledWith(1.5, 0, 0, 1.5, 0, 0);
    expect(context.arc).toHaveBeenCalled();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
    expect(ResizeObserverMock.instances[0]?.observe).toHaveBeenCalled();
    expect(IntersectionObserverMock.instances[0]?.observe).toHaveBeenCalledWith(canvas);

    act(() => ResizeObserverMock.instances[0]?.trigger(320, 200));
    expect(canvas?.width).toBe(480);
    expect(canvas?.height).toBe(300);

    unmount();
    expect(ResizeObserverMock.instances[0]?.disconnect).toHaveBeenCalledOnce();
    expect(IntersectionObserverMock.instances[0]?.disconnect).toHaveBeenCalledOnce();
  });

  it('pauses and resumes animation for viewport and document visibility changes', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<ProjectConstellation />);
    const intersection = IntersectionObserverMock.instances[0];

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    act(() => intersection?.trigger(false));
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);

    act(() => intersection?.trigger(true));
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);

    act(() => {
      documentHidden = true;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(2);

    act(() => {
      documentHidden = false;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(3);

    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(3);
    expect(removeListener).toHaveBeenCalledWith('pointermove', expect.any(Function));
  });

  it('honors prefers-reduced-motion and removes its preference listener', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener,
      removeEventListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const { unmount } = render(<ProjectConstellation motionEnabled />);

    expect(context.clearRect).toHaveBeenCalled();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
