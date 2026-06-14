/**
 * Simple 2D Particle Physics for Coolant Flow
 *
 * Features:
 * - Particle position and velocity
 * - Pipe boundary collision
 * - Temperature-based coloring
 * - Trail rendering
 */

export interface Vec2 {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  temperature: number; // 0-1, affects color
  trail: Vec2[]; // Previous positions for trail effect
}

export interface PipeSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  direction: "horizontal" | "vertical";
}

export interface PhysicsConfig {
  friction: number; // 0-1, velocity dampening
  maxTrailLength: number;
  baseSpeed: number;
  temperatureDecay: number; // How fast particles cool
  temperatureGain: number; // How fast particles heat near reactor
}

const DEFAULT_CONFIG: PhysicsConfig = {
  friction: 0.98,
  maxTrailLength: 5,
  baseSpeed: 2,
  temperatureDecay: 0.005,
  temperatureGain: 0.02,
};

export function createParticle(
  x: number,
  y: number,
  vx: number = 0,
  vy: number = 0
): Particle {
  return {
    x,
    y,
    vx,
    vy,
    temperature: 0.2,
    trail: [],
  };
}

export function updateParticle(
  particle: Particle,
  pipes: PipeSegment[],
  reactorZone: { x: number; y: number; radius: number },
  config: PhysicsConfig = DEFAULT_CONFIG
): void {
  // Store previous position for trail
  particle.trail.push({ x: particle.x, y: particle.y });
  if (particle.trail.length > config.maxTrailLength) {
    particle.trail.shift();
  }

  // Apply velocity
  particle.x += particle.vx;
  particle.y += particle.vy;

  // Apply friction
  particle.vx *= config.friction;
  particle.vy *= config.friction;

  // Check pipe boundaries and redirect flow
  let inPipe = false;
  for (const pipe of pipes) {
    if (isInPipe(particle, pipe)) {
      inPipe = true;
      constrainToPipe(particle, pipe, config.baseSpeed);
      break;
    }
  }

  // If particle escaped pipes, respawn at intake
  if (!inPipe) {
    // Will be handled by the panel
    particle.x = -1;
    particle.y = -1;
  }

  // Temperature: heat up near reactor, cool down otherwise
  const distToReactor = Math.sqrt(
    Math.pow(particle.x - reactorZone.x, 2) +
      Math.pow(particle.y - reactorZone.y, 2)
  );

  if (distToReactor < reactorZone.radius) {
    particle.temperature = Math.min(
      1,
      particle.temperature + config.temperatureGain
    );
  } else {
    particle.temperature = Math.max(
      0,
      particle.temperature - config.temperatureDecay
    );
  }
}

function isInPipe(particle: Particle, pipe: PipeSegment): boolean {
  const halfWidth = pipe.width / 2;

  if (pipe.direction === "horizontal") {
    const minX = Math.min(pipe.x1, pipe.x2);
    const maxX = Math.max(pipe.x1, pipe.x2);
    return (
      particle.x >= minX &&
      particle.x <= maxX &&
      Math.abs(particle.y - pipe.y1) <= halfWidth
    );
  } else {
    const minY = Math.min(pipe.y1, pipe.y2);
    const maxY = Math.max(pipe.y1, pipe.y2);
    return (
      particle.y >= minY &&
      particle.y <= maxY &&
      Math.abs(particle.x - pipe.x1) <= halfWidth
    );
  }
}

function constrainToPipe(
  particle: Particle,
  pipe: PipeSegment,
  baseSpeed: number
): void {
  const halfWidth = pipe.width / 2;

  if (pipe.direction === "horizontal") {
    // Constrain Y to pipe center
    particle.y = pipe.y1;

    // Flow direction based on pipe orientation
    const flowDir = pipe.x2 > pipe.x1 ? 1 : -1;
    particle.vx = baseSpeed * flowDir * (0.8 + Math.random() * 0.4);
    particle.vy = 0;

    // Check if at pipe end, need to find connecting pipe
    if (
      (flowDir > 0 && particle.x >= pipe.x2) ||
      (flowDir < 0 && particle.x <= pipe.x2)
    ) {
      particle.x = pipe.x2;
    }
  } else {
    // Vertical pipe
    particle.x = pipe.x1;

    const flowDir = pipe.y2 > pipe.y1 ? 1 : -1;
    particle.vx = 0;
    particle.vy = baseSpeed * flowDir * (0.8 + Math.random() * 0.4);

    if (
      (flowDir > 0 && particle.y >= pipe.y2) ||
      (flowDir < 0 && particle.y <= pipe.y2)
    ) {
      particle.y = pipe.y2;
    }
  }
}

export function getTemperatureColor(
  temperature: number,
  colors: { cool: string; nominal: string; warm: string; hot: string }
): string {
  if (temperature < 0.25) return colors.cool;
  if (temperature < 0.5) return colors.nominal;
  if (temperature < 0.75) return colors.warm;
  return colors.hot;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
