/**
 * HeroLocomotive.tsx
 *
 * A cool autonomous steam locomotive model that lives strictly inside the Hero section,
 * cruising slowly and majestically beneath the foreground text and buttons.
 *
 * Features:
 * - Sticks strictly to the Hero section (absolute overlay inside section#home)
 * - Layered below buttons and cards (z-[2] vs container z-10)
 * - Always cruises slowly and calmly (~32-42 px/s)
 * - Automatically spits out physics and exam prep slogans as it travels
 * - Fully responsive: scales down neatly for mobile devices (iPhone, Android, tablets)
 * - Non-blocking passive interactions; zero extra settings buttons; zero audio requirements
 */

import { useEffect, useRef } from "react";
import type {
  PathPoint,
  SteamParticle,
  SparkParticle,
  FloatingBubble,
} from "./types";
import {
  drawTracks,
  drawHeadlightBeam,
  drawEngine,
  drawTender,
  drawCoach1,
  drawCoach2,
  updateAndDrawSteam,
  updateAndDrawSparks,
  updateAndDrawBubbles,
} from "./renderTrain";

const SLOGANS = [
  "Next Stop: 100/100 in PUC Physics! 🎯",
  "Physics Pep Talk Express! 🌟",
  "E = mc² — High Energy Prep! ⚛️",
  "Newton's Laws in Full Throttle! 🚀",
  "Thermodynamics: Full Steam Ahead! 🔥",
  "Quantum Leap to Top KCET Rank! ⚡",
  "F = ma — Unstoppable Momentum! ⚙️",
  "Kinematics Mastery: On Track! 📐",
  "Wave Optics: Clear Path to Success! 🌊",
  "Electrostatics: Fully Charged! 💡",
  "Centripetal Force at Every Turn! 💫",
];

export default function HeroLocomotive() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stateRef = useRef({
    width: 1200,
    height: 700,
    scale: 0.82,
    speed: 40,
    x: 180,
    y: 280,
    angle: 0.15,
    targetX: 650,
    targetY: 340,
    totalDist: 0,
    wheelAngle: 0,
    pistonCycle: 0,
    history: [] as PathPoint[],
    steam: [] as SteamParticle[],
    sparks: [] as SparkParticle[],
    bubbles: [] as FloatingBubble[],
    nextWaypointTimer: 0,
    nextSloganTimer: 3.5, // First slogan after 3.5s
    sloganIndex: 0,
    bubbleId: 0,
    lastTime: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const spawnSlogan = (customText?: string) => {
      const s = stateRef.current;
      const text = customText || SLOGANS[s.sloganIndex % SLOGANS.length];
      s.sloganIndex++;

      // Spawn bubble directly above the locomotive
      s.bubbles.push({
        id: ++s.bubbleId,
        text,
        x: s.x,
        y: s.y - 38 * s.scale,
        alpha: 1.0,
        vy: -15, // Gentle slow rise
      });

      // Extra puff of white steam when spitting out slogan
      const stackOffsetX = 34 * s.scale;
      const stackOffsetY = -25 * s.scale;
      const stackX = s.x + Math.cos(s.angle) * stackOffsetX - Math.sin(s.angle) * stackOffsetY;
      const stackY = s.y + Math.sin(s.angle) * stackOffsetX + Math.cos(s.angle) * stackOffsetY;

      for (let i = 0; i < 7; i++) {
        s.steam.push({
          x: stackX + (Math.random() * 4 - 2),
          y: stackY + (Math.random() * 4 - 2),
          vx: (Math.random() * 20 - 10),
          vy: -35 - Math.random() * 30,
          radius: 4 * s.scale,
          maxRadius: (16 + Math.random() * 8) * s.scale,
          alpha: 0.85,
          maxAlpha: 0.85,
          spin: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 2,
          color: "#ffffff",
          isWhistle: true,
        });
      }
    };

    const pickNewWaypoint = () => {
      const s = stateRef.current;
      const isMobile = s.width < 640;
      const padX = isMobile ? 24 : 65;
      const padY = isMobile ? 36 : 70;

      const availW = Math.max(160, s.width - padX * 2);
      const availH = Math.max(160, s.height - padY * 2);

      // Choose a gentle destination that prevents tight hairpin turns
      s.targetX = padX + Math.random() * availW;
      s.targetY = padY + Math.random() * availH;

      // Reset waypoint timer (6-11 seconds of travel per waypoint)
      s.nextWaypointTimer = 7 + Math.random() * 5;
    };

    const updateSize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 650;
      const dpr = window.devicePixelRatio || 1;

      stateRef.current.width = w;
      stateRef.current.height = h;

      // Proportional responsive scaling for mobile vs desktop
      let nextScale = 0.82;
      let nextSpeed = 42;
      if (w < 640) {
        nextScale = 0.52; // Compact for phones so train fits effortlessly
        nextSpeed = 30;   // Slower leisurely speed on phones
      } else if (w < 1024) {
        nextScale = 0.68;
        nextSpeed = 36;
      }
      stateRef.current.scale = nextScale;
      stateRef.current.speed = nextSpeed;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Initialize start position if empty
      const s = stateRef.current;
      if (s.history.length === 0) {
        s.x = Math.max(40, w * 0.2);
        s.y = Math.max(60, h * 0.4);
        s.targetX = Math.max(80, w * 0.75);
        s.targetY = Math.max(80, h * 0.5);

        for (let i = 0; i < 40; i++) {
          s.history.push({
            x: s.x - (40 - i) * 5,
            y: s.y,
            angle: 0.1,
            dist: i * 5,
          });
        }
        s.totalDist = 40 * 5;
      }
    };

    updateSize();

    // ResizeObserver ensures exact sync with Hero section size changes
    const ro = new ResizeObserver(() => {
      updateSize();
    });
    ro.observe(container);

    // Passive tap interaction on the hero section to pop an extra slogan if tapped near train
    const handleTap = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = container.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      const dist = Math.hypot(localX - s.x, localY - s.y);
      if (dist < 60 * s.scale) {
        spawnSlogan();
      }
    };
    container.addEventListener("pointerdown", handleTap, { passive: true });

    // Animation Loop
    const loop = (timestamp: number) => {
      animId = requestAnimationFrame(loop);
      const s = stateRef.current;
      if (!s.lastTime) s.lastTime = timestamp;
      let dt = (timestamp - s.lastTime) / 1000;
      s.lastTime = timestamp;
      if (dt > 0.1) dt = 0.1; // Clamp frame drops

      ctx.clearRect(0, 0, s.width, s.height);

      // ── 1. Slogan Timer ─────────────────────────────────────────────
      s.nextSloganTimer -= dt;
      if (s.nextSloganTimer <= 0) {
        spawnSlogan();
        s.nextSloganTimer = 6.5 + Math.random() * 3.5; // Next slogan in 6.5 - 10s
      }

      // ── 2. Waypoint & Slow Steering Physics ──────────────────────────
      s.nextWaypointTimer -= dt;
      const distToTarget = Math.hypot(s.targetX - s.x, s.targetY - s.y);
      if (distToTarget < 65 || s.nextWaypointTimer <= 0) {
        pickNewWaypoint();
      }

      const dx = s.targetX - s.x;
      const dy = s.targetY - s.y;
      const desiredAngle = Math.atan2(dy, dx);

      let angleDiff = desiredAngle - s.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Majestic wide turns — steady turn rate
      const maxTurn = 1.05 * dt;
      const turnStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), maxTurn);
      s.angle += turnStep;

      // Forward step at constant slow cruising speed
      const ds = s.speed * dt;
      s.x += Math.cos(s.angle) * ds;
      s.y += Math.sin(s.angle) * ds;
      s.totalDist += ds;

      // Soft clamp to hero bounds with cushion
      const padX = s.width < 640 ? 18 : 45;
      const padY = s.width < 640 ? 25 : 50;
      if (s.x < padX) { s.x = padX; s.angle = Math.abs(s.angle); }
      if (s.x > s.width - padX) { s.x = s.width - padX; s.angle = Math.PI - s.angle; }
      if (s.y < padY) { s.y = padY; s.angle = Math.abs(s.angle); }
      if (s.y > s.height - padY) { s.y = s.height - padY; s.angle = -Math.abs(s.angle); }

      // Wheel and piston animation
      s.wheelAngle += ds / (9 * s.scale);
      s.pistonCycle = s.wheelAngle;

      // Store history point
      s.history.push({
        x: s.x,
        y: s.y,
        angle: s.angle,
        dist: s.totalDist,
      });

      // Prune history
      const maxHistoryDist = 480 * s.scale;
      while (s.history.length > 2 && s.history[0].dist < s.totalDist - maxHistoryDist) {
        s.history.shift();
      }

      // ── 3. Gentle Steam Puffs ────────────────────────────────────────
      const stackOffsetX = 34 * s.scale;
      const stackOffsetY = -25 * s.scale;
      const stackX = s.x + Math.cos(s.angle) * stackOffsetX - Math.sin(s.angle) * stackOffsetY;
      const stackY = s.y + Math.sin(s.angle) * stackOffsetX + Math.cos(s.angle) * stackOffsetY;

      if (Math.random() < 0.28) {
        s.steam.push({
          x: stackX,
          y: stackY,
          vx: -Math.cos(s.angle) * (s.speed * 0.4) + (Math.random() * 10 - 5),
          vy: -Math.sin(s.angle) * (s.speed * 0.4) - 22 - Math.random() * 15,
          radius: 3.5 * s.scale,
          maxRadius: (15 + Math.random() * 8) * s.scale,
          alpha: 0.65,
          maxAlpha: 0.65,
          spin: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 1.5,
          color: "#f1f5f9",
        });
      }

      // ── 4. Articulated Carriages ─────────────────────────────────────
      const getCarAtDistance = (targetDist: number) => {
        if (s.history.length === 0) return { x: s.x, y: s.y, angle: s.angle };
        if (targetDist <= s.history[0].dist) {
          const first = s.history[0];
          return { x: first.x, y: first.y, angle: first.angle };
        }

        let low = 0;
        let high = s.history.length - 1;
        while (low <= high) {
          const mid = (low + high) >> 1;
          if (s.history[mid].dist < targetDist) {
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }

        const idx = Math.max(1, Math.min(s.history.length - 1, low));
        const p1 = s.history[idx - 1];
        const p2 = s.history[idx];
        const span = p2.dist - p1.dist;
        const t = span > 0 ? (targetDist - p1.dist) / span : 0;

        const cx = p1.x + (p2.x - p1.x) * t;
        const cy = p1.y + (p2.y - p1.y) * t;
        const carAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        return { x: cx, y: cy, angle: carAngle };
      };

      const tenderDist = s.totalDist - 68 * s.scale;
      const coach1Dist = s.totalDist - 138 * s.scale;
      const coach2Dist = s.totalDist - 216 * s.scale;

      const tender = getCarAtDistance(tenderDist);
      const coach1 = getCarAtDistance(coach1Dist);
      const coach2 = getCarAtDistance(coach2Dist);

      // ── 5. Render Canvas (Below Buttons) ─────────────────────────────
      // 1. Dynamic glowing rails
      drawTracks(ctx, s.history, s.totalDist, { x: s.targetX, y: s.targetY }, s.scale);

      // 2. Headlight cone
      const noseX = s.x + Math.cos(s.angle) * (46 * s.scale);
      const noseY = s.y + Math.sin(s.angle) * (46 * s.scale);
      drawHeadlightBeam(ctx, noseX, noseY, s.angle, s.scale);

      // 3. Train Consist
      drawCoach2(ctx, coach2.x, coach2.y, coach2.angle, s.wheelAngle, s.scale);
      drawCoach1(ctx, coach1.x, coach1.y, coach1.angle, s.wheelAngle, s.scale);
      drawTender(ctx, tender.x, tender.y, tender.angle, s.wheelAngle, s.scale);
      drawEngine(
        ctx,
        s.x,
        s.y,
        s.angle,
        s.wheelAngle,
        s.pistonCycle,
        s.scale
      );

      // 4. Steam particles & Sparks
      updateAndDrawSparks(ctx, s.sparks, dt);
      updateAndDrawSteam(ctx, s.steam, dt);

      // 5. Floating Slogans
      updateAndDrawBubbles(ctx, s.bubbles, dt, s.width, s.scale);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      container.removeEventListener("pointerdown", handleTap);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-[2]"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
