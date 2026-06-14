/**
 * Common animation configurations for OpenTUI examples
 */

export type EasingFunction = (t: number) => number;

// Standard easing functions
export const easings: Record<string, EasingFunction> = {
  linear: (t) => t,

  // Quad
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Quart
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - --t * t * t * t,
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),

  // Elastic
  easeInElastic: (t) =>
    t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)),
  easeOutElastic: (t) =>
    t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
  easeInOutElastic: (t) =>
    t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 + 1,

  // Bounce
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  easeInBounce: (t) => 1 - easings.easeOutBounce(1 - t),

  // Back
  easeInBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
};

// Animation duration presets (in milliseconds)
export const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

// Common animation preset configurations
export interface AnimationPreset {
  duration: number;
  easing: EasingFunction;
}

export const presets: Record<string, AnimationPreset> = {
  fadeIn: { duration: durations.normal, easing: easings.easeOutQuad },
  fadeOut: { duration: durations.fast, easing: easings.easeInQuad },
  slideIn: { duration: durations.normal, easing: easings.easeOutCubic },
  slideOut: { duration: durations.fast, easing: easings.easeInCubic },
  bounce: { duration: durations.slow, easing: easings.easeOutBounce },
  elastic: { duration: durations.slow, easing: easings.easeOutElastic },
  pop: { duration: durations.normal, easing: easings.easeOutBack },
};

// Helper to interpolate between values
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Helper to interpolate colors (hex format)
export function lerpColor(startHex: string, endHex: string, t: number): string {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);

  const r = Math.round(lerp(start.r, end.r, t));
  const g = Math.round(lerp(start.g, end.g, t));
  const b = Math.round(lerp(start.b, end.b, t));

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Simple animation runner for frame-based animations
export class AnimationRunner {
  private animations: Map<string, Animation> = new Map();
  private frameId: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  start(
    id: string,
    duration: number,
    easing: EasingFunction,
    onUpdate: (progress: number) => void,
    onComplete?: () => void
  ): void {
    const startTime = Date.now();
    this.animations.set(id, {
      startTime,
      duration,
      easing,
      onUpdate,
      onComplete,
    });
    this.ensureRunning();
  }

  stop(id: string): void {
    this.animations.delete(id);
  }

  stopAll(): void {
    this.animations.clear();
  }

  private ensureRunning(): void {
    if (!this.running && this.animations.size > 0) {
      this.running = true;
      this.tick();
    }
  }

  private tick = (): void => {
    if (this.animations.size === 0) {
      this.running = false;
      this.frameId = null;
      return;
    }

    const now = Date.now();
    const completed: string[] = [];

    for (const [id, anim] of this.animations) {
      const elapsed = now - anim.startTime;
      const rawProgress = Math.min(elapsed / anim.duration, 1);
      const easedProgress = anim.easing(rawProgress);

      anim.onUpdate(easedProgress);

      if (rawProgress >= 1) {
        completed.push(id);
        anim.onComplete?.();
      }
    }

    for (const id of completed) {
      this.animations.delete(id);
    }

    if (this.animations.size > 0) {
      this.frameId = setTimeout(this.tick, 16); // ~60fps
    } else {
      this.running = false;
      this.frameId = null;
    }
  };
}

interface Animation {
  startTime: number;
  duration: number;
  easing: EasingFunction;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}
