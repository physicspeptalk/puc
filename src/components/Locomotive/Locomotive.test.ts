/**
 * Locomotive.test.ts — Unit tests for Locomotive rendering utilities and geometry.
 */

import { describe, it, expect } from "vitest";
import { drawTracks, updateAndDrawBubbles } from "./renderTrain";
import type { PathPoint, FloatingBubble } from "./types";

describe("HeroLocomotive utilities", () => {
  it("drawTracks handles empty or single-point history safely without errors", () => {
    // Mock minimal Canvas 2D context
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      arc: () => {},
      fill: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
    } as unknown as CanvasRenderingContext2D;

    expect(() => drawTracks(mockCtx, [], 0)).not.toThrow();
    expect(() => drawTracks(mockCtx, [{ x: 10, y: 10, angle: 0, dist: 0 }], 0)).not.toThrow();
  });

  it("drawTracks renders multi-point track history safely", () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      arc: () => {},
      fill: () => {},
      setLineDash: () => {},
      quadraticCurveTo: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
    } as unknown as CanvasRenderingContext2D;

    const history: PathPoint[] = [
      { x: 0, y: 100, angle: 0, dist: 0 },
      { x: 50, y: 100, angle: 0, dist: 50 },
      { x: 100, y: 100, angle: 0, dist: 100 },
    ];

    expect(() => drawTracks(mockCtx, history, 100, { x: 150, y: 100 }, 0.8)).not.toThrow();
  });

  it("updateAndDrawBubbles removes expired bubbles and clamps horizontally", () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      fill: () => {},
      roundRect: () => {},
      measureText: () => ({ width: 80 }),
      fillText: () => {},
    } as unknown as CanvasRenderingContext2D;

    const bubbles: FloatingBubble[] = [
      { id: 1, text: "F = ma", x: 200, y: 150, alpha: 0.9, vy: -15 },
      { id: 2, text: "Expired", x: 200, y: 150, alpha: 0.005, vy: -15 }, // below threshold
    ];

    updateAndDrawBubbles(mockCtx, bubbles, 0.1, 400, 0.52);
    // The second expired bubble should be pruned
    expect(bubbles.length).toBe(1);
    expect(bubbles[0].id).toBe(1);
  });
});
