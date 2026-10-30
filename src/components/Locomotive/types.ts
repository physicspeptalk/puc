/**
 * types.ts — Types and interfaces for the Locomotive simulation.
 */

export type NavigationMode = "roam" | "follow" | "perimeter";
export type SpeedPreset = "slow" | "cruise" | "turbo" | "paused";
export type LayerDepth = "front" | "back";

export interface PathPoint {
  x: number;
  y: number;
  angle: number;
  dist: number;
}

export interface SteamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  maxAlpha: number;
  spin: number;
  spinSpeed: number;
  color: string;
  isWhistle?: boolean;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export interface FloatingBubble {
  id: number;
  text: string;
  x: number;
  y: number;
  alpha: number;
  vy: number;
}
