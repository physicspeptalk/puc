/**
 * renderTrain.ts — High-fidelity Canvas 2D rendering routines for the Locomotive,
 * including dynamic glowing rails, volumetric headlight beam, engine, tender, carriages,
 * animated drive wheels with reciprocating side rods, steam puffs, and sparks.
 */

import type { PathPoint, SteamParticle, SparkParticle, FloatingBubble } from "./types";

const TRACK_GAUGE = 18; // Distance between dual rails in px
const WHEEL_RADIUS = 9;  // Large drive wheel radius
const PILOT_RADIUS = 5.5; // Small pilot wheel radius

/**
 * Draws dynamic glowing rails and wooden/steel sleepers (ties) along the recent path history.
 */
export function drawTracks(
  ctx: CanvasRenderingContext2D,
  history: PathPoint[],
  currentDist: number,
  lookaheadTarget?: { x: number; y: number } | null,
  scale = 1
): void {
  if (history.length < 2) return;

  const maxTrailDist = 480 * scale; // Distance of glowing tracks behind locomotive
  const startDist = Math.max(0, currentDist - maxTrailDist);
  const gauge = TRACK_GAUGE * scale;

  // Filter relevant history segment
  const trailPoints: PathPoint[] = [];
  for (let i = history.length - 1; i >= 0; i--) {
    const pt = history[i];
    if (pt.dist >= startDist) {
      trailPoints.push(pt);
    } else {
      break;
    }
  }

  if (trailPoints.length < 2) return;
  trailPoints.reverse(); // Now in chronological order

  ctx.save();

  // 1. Draw Sleepers (Railroad ties)
  let lastTieDist = trailPoints[0].dist;
  const tieSpacing = Math.max(8, 12 * scale); // Scaled spacing

  for (let i = 0; i < trailPoints.length; i++) {
    const pt = trailPoints[i];
    if (pt.dist - lastTieDist >= tieSpacing) {
      lastTieDist = pt.dist;
      const progress = (pt.dist - startDist) / maxTrailDist; // 0 at tail, 1 at front
      const alpha = Math.max(0, Math.min(0.55, progress * 0.7));

      const perpX = -Math.sin(pt.angle);
      const perpY = Math.cos(pt.angle);
      const halfLength = gauge * 0.85;

      ctx.save();
      ctx.strokeStyle = `rgba(165, 180, 252, ${alpha * 0.6})`;
      ctx.lineWidth = Math.max(1.8, 3.2 * scale);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(pt.x - perpX * halfLength, pt.y - perpY * halfLength);
      ctx.lineTo(pt.x + perpX * halfLength, pt.y + perpY * halfLength);
      ctx.stroke();

      // Tie fastening spikes / glowing rivets
      ctx.fillStyle = `rgba(20, 184, 138, ${alpha * 0.8})`;
      const rivetOffset = gauge * 0.52;
      ctx.beginPath();
      ctx.arc(pt.x - perpX * rivetOffset, pt.y - perpY * rivetOffset, Math.max(0.8, 1.2 * scale), 0, Math.PI * 2);
      ctx.arc(pt.x + perpX * rivetOffset, pt.y + perpY * rivetOffset, Math.max(0.8, 1.2 * scale), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // 2. Draw Left and Right Glowing Rails
  const drawSingleRail = (offsetMultiplier: number) => {
    ctx.beginPath();
    let started = false;

    for (let i = 0; i < trailPoints.length; i++) {
      const pt = trailPoints[i];
      const perpX = -Math.sin(pt.angle);
      const perpY = Math.cos(pt.angle);
      const rx = pt.x + perpX * (gauge / 2) * offsetMultiplier;
      const ry = pt.y + perpY * (gauge / 2) * offsetMultiplier;

      if (!started) {
        ctx.moveTo(rx, ry);
        started = true;
      } else {
        ctx.lineTo(rx, ry);
      }
    }

    // Gradient fade along trail
    const head = trailPoints[trailPoints.length - 1];
    const tail = trailPoints[0];
    const grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
    grad.addColorStop(0, "rgba(99, 102, 241, 0)");
    grad.addColorStop(0.3, "rgba(99, 102, 241, 0.22)");
    grad.addColorStop(0.8, "rgba(99, 102, 241, 0.65)");
    grad.addColorStop(1, "rgba(45, 212, 170, 0.85)");

    // Outer glow
    ctx.strokeStyle = grad;
    ctx.lineWidth = Math.max(1.5, 2.4 * scale);
    ctx.stroke();

    // Inner bright steel specular line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = Math.max(0.6, 0.9 * scale);
    ctx.stroke();
  };

  drawSingleRail(1);
  drawSingleRail(-1);

  // 3. Faint Projected Guiding Track toward upcoming target
  if (lookaheadTarget && trailPoints.length > 0) {
    const head = trailPoints[trailPoints.length - 1];
    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = "rgba(45, 212, 170, 0.2)";
    ctx.lineWidth = Math.max(1, 1.4 * scale);

    // Draw gentle curve to target
    ctx.beginPath();
    ctx.moveTo(head.x, head.y);
    const cpX = head.x + Math.cos(head.angle) * (60 * scale);
    const cpY = head.y + Math.sin(head.angle) * (60 * scale);
    ctx.quadraticCurveTo(cpX, cpY, lookaheadTarget.x, lookaheadTarget.y);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws the forward volumetric headlight beam from the locomotive.
 */
export function drawHeadlightBeam(
  ctx: CanvasRenderingContext2D,
  headX: number,
  headY: number,
  angle: number,
  scale = 1
): void {
  const beamLength = 210 * scale;
  const beamSpread = 0.44; // radians (~25 deg each side)

  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(angle);

  // Volumetric cone
  const coneGrad = ctx.createRadialGradient(0, 0, 3 * scale, beamLength * 0.65, 0, beamLength);
  coneGrad.addColorStop(0, "rgba(255, 253, 230, 0.8)");
  coneGrad.addColorStop(0.12, "rgba(254, 240, 138, 0.4)");
  coneGrad.addColorStop(0.45, "rgba(99, 102, 241, 0.15)");
  coneGrad.addColorStop(0.85, "rgba(20, 184, 138, 0.04)");
  coneGrad.addColorStop(1, "rgba(20, 184, 138, 0)");

  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, beamLength, -beamSpread, beamSpread);
  ctx.closePath();
  ctx.fill();

  // Floating ambient motes in headlight
  const time = performance.now() * 0.001;
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  for (let i = 0; i < 5; i++) {
    const dist = (30 + ((i * 37 + time * 35) % (beamLength - 40))) * scale;
    const spreadY = Math.sin(i * 1.7 + time * 1.3) * (dist * 0.25);
    const moteSize = (1.0 + (i % 3) * 0.5) * scale;
    ctx.beginPath();
    ctx.arc(dist, spreadY, moteSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws the Locomotive Engine (the iron horse with drive wheels and reciprocating rods).
 */
export function drawEngine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  wheelAngle: number,
  pistonCycle: number,
  scale = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  // Local coordinates:
  // Train is moving toward +X.
  // Front nose at x = +46, Rear cab at x = -44.
  // Top of stack at y = -30, Track level at y = +13.

  // 1. Shadow underneath
  ctx.save();
  ctx.fillStyle = "rgba(2, 6, 23, 0.55)";
  ctx.beginPath();
  ctx.ellipse(0, 13, 48, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Cowcatcher / Pilot Grill (Front wedge)
  ctx.save();
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(42, 4);
  ctx.lineTo(54, 12);
  ctx.lineTo(40, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Grill stripes
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1;
  for (let gx = 44; gx <= 50; gx += 3) {
    ctx.beginPath();
    ctx.moveTo(gx, 6 + (gx - 42) * 1.2);
    ctx.lineTo(gx - 2, 12);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Steam Cylinder & Crosshead Guide (at x = 28..38, y = 3..11)
  ctx.save();
  // Cylinder body
  const cylGrad = ctx.createLinearGradient(0, 4, 0, 11);
  cylGrad.addColorStop(0, "#334155");
  cylGrad.addColorStop(0.5, "#475569");
  cylGrad.addColorStop(1, "#1e293b");
  ctx.fillStyle = cylGrad;
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1;
  ctx.fillRect(28, 4, 13, 7);
  ctx.strokeRect(28, 4, 13, 7);

  // Reciprocating Piston Rod
  const pistonStroke = 4.2;
  const pistonPos = Math.cos(pistonCycle) * pistonStroke;
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(22 + pistonPos, 6.5, 9, 2.2);

  // Crosshead slider
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(20 + pistonPos, 5, 4, 5);
  ctx.restore();

  // 4. Main Boiler (Cylinder from x = -18 to +42, y = -14 to +4)
  ctx.save();
  const boilerGrad = ctx.createLinearGradient(0, -14, 0, 4);
  boilerGrad.addColorStop(0, "#1e1b4b");   // Deep indigo midnight
  boilerGrad.addColorStop(0.2, "#4338ca"); // Highlight sheen
  boilerGrad.addColorStop(0.5, "#312e81");
  boilerGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = boilerGrad;
  ctx.beginPath();
  ctx.roundRect(-18, -14, 60, 18, [3, 6, 2, 2]);
  ctx.fill();

  // Polished Brass Boiler Bands
  ctx.strokeStyle = "#f59e0b"; // Gold/brass
  ctx.lineWidth = 1.4;
  [-6, 12, 30].forEach((bx) => {
    ctx.beginPath();
    ctx.moveTo(bx, -14);
    ctx.lineTo(bx, 4);
    ctx.stroke();
  });

  // Front Smokebox Door (Front circle/dome at x = 42)
  const smokeboxGrad = ctx.createRadialGradient(42, -5, 2, 42, -5, 9);
  smokeboxGrad.addColorStop(0, "#475569");
  smokeboxGrad.addColorStop(0.8, "#1e293b");
  smokeboxGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = smokeboxGrad;
  ctx.beginPath();
  ctx.ellipse(42, -5, 3.5, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 5. Chimney / Smokestack (x = 34, y = -14 down to -25)
  ctx.save();
  const stackGrad = ctx.createLinearGradient(31, 0, 37, 0);
  stackGrad.addColorStop(0, "#1e293b");
  stackGrad.addColorStop(0.4, "#475569");
  stackGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = stackGrad;
  ctx.beginPath();
  ctx.moveTo(32, -14);
  ctx.lineTo(31, -24);
  ctx.lineTo(37, -24);
  ctx.lineTo(36, -14);
  ctx.closePath();
  ctx.fill();

  // Brass Lip on stack
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.roundRect(30, -26, 8, 2.5, 1);
  ctx.fill();
  ctx.restore();

  // 6. Steam Dome & Sand Dome on top of boiler
  ctx.save();
  const drawDome = (dx: number, height: number, width: number) => {
    const domeGrad = ctx.createLinearGradient(dx - width / 2, -14 - height, dx + width / 2, -14);
    domeGrad.addColorStop(0, "#fde68a");
    domeGrad.addColorStop(0.4, "#f59e0b");
    domeGrad.addColorStop(1, "#78350f");
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(dx, -14, width / 2, Math.PI, 0, false);
    ctx.fill();
  };
  drawDome(18, 6, 7);  // Sand dome
  drawDome(2, 7.5, 8); // Steam dome
  ctx.restore();

  // 7. Engineer Cab (x = -42 to -18, y = -22 to +4)
  ctx.save();
  // Cab body
  const cabGrad = ctx.createLinearGradient(0, -22, 0, 4);
  cabGrad.addColorStop(0, "#312e81");
  cabGrad.addColorStop(0.3, "#4338ca");
  cabGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = cabGrad;
  ctx.beginPath();
  ctx.roundRect(-42, -22, 24, 26, [3, 2, 0, 0]);
  ctx.fill();

  // Cab Roof Curve with overhang
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.roundRect(-44, -24, 27, 3, 1.5);
  ctx.fill();

  // Arched Cab Window with warm glowing interior
  const winGrad = ctx.createRadialGradient(-30, -13, 1, -30, -13, 7);
  winGrad.addColorStop(0, "rgba(254, 240, 138, 0.95)"); // Bright golden light
  winGrad.addColorStop(0.6, "rgba(245, 158, 11, 0.75)");
  winGrad.addColorStop(1, "rgba(180, 83, 9, 0.5)");
  ctx.fillStyle = winGrad;
  ctx.beginPath();
  ctx.roundRect(-35, -18, 10, 10, [4, 4, 1, 1]);
  ctx.fill();
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Silhouette of Engineer inside
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.beginPath();
  // Head with cap visor
  ctx.arc(-29, -14, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-29, -15);
  ctx.lineTo(-26, -14.5);
  ctx.stroke();

  // Gold Coach Trim on Cab
  ctx.strokeStyle = "rgba(251, 191, 36, 0.7)";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(-40, -5, 20, 7);

  // Cab side text "PEP TALK"
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 4px sans-serif";
  ctx.fillText("PEP TALK", -39, -0.5);
  ctx.restore();

  // 8. Headlight on Smokebox Front (x = 44, y = -10)
  ctx.save();
  // Lamp bracket & housing
  ctx.fillStyle = "#78350f";
  ctx.fillRect(42, -12, 3, 5);
  ctx.fillStyle = "#fbbf24";
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(44, -13, 6, 7, 2);
  ctx.fill();
  ctx.stroke();

  // Glowing center lens
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#fef08a";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(49.5, -9.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 9. Running Gear: Wheels and Articulated Side Rods
  // Small front guide wheels (Pilot bogie at x = 36)
  drawSmallWheel(ctx, 36, 9.5, wheelAngle * 1.6);

  // Three large drive wheels at x = -28, -8, +12 (track level y = 6.5)
  const wheelXPositions = [-28, -8, 12];
  wheelXPositions.forEach((wx) => {
    drawDriveWheel(ctx, wx, 6.5, wheelAngle);
  });

  // Connecting Side Rod (links all 3 drive wheels at crankpin)
  const crankRadius = 4.2;
  const crankX = Math.cos(wheelAngle) * crankRadius;
  const crankY = Math.sin(wheelAngle) * crankRadius;

  ctx.save();
  // Side coupling rod
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(wheelXPositions[0] + crankX, 6.5 + crankY);
  ctx.lineTo(wheelXPositions[2] + crankX, 6.5 + crankY);
  ctx.stroke();

  // Main piston rod (from center wheel crankpin to sliding crosshead at x = 22 + pistonPos)
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(wheelXPositions[1] + crankX, 6.5 + crankY);
  ctx.lineTo(22 + pistonPos, 7.5);
  ctx.stroke();

  // Crankpin brass caps on wheels
  ctx.fillStyle = "#f59e0b";
  wheelXPositions.forEach((wx) => {
    ctx.beginPath();
    ctx.arc(wx + crankX, 6.5 + crankY, 1.6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  ctx.restore();
}

/**
 * Helper to draw a single drive wheel with counterweight, spokes, and steel rim.
 */
function drawDriveWheel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Outer Steel Rim
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, WHEEL_RADIUS, 0, Math.PI * 2);
  ctx.stroke();

  // Counterweight crescent on bottom half
  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.arc(0, 0, WHEEL_RADIUS - 1.2, 0, Math.PI, false);
  ctx.arc(0, 0, WHEEL_RADIUS - 3.8, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  // 8 Spokes
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const spAngle = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(spAngle) * (WHEEL_RADIUS - 1), Math.sin(spAngle) * (WHEEL_RADIUS - 1));
    ctx.stroke();
  }

  // Brass Center Hubcap
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Helper to draw a small front pilot wheel.
 */
function drawSmallWheel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, PILOT_RADIUS, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    const spAngle = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(spAngle) * (PILOT_RADIUS - 1), Math.sin(spAngle) * (PILOT_RADIUS - 1));
    ctx.stroke();
  }

  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the Tender Car (Coal / Quantum Plasma Energy Car).
 */
export function drawTender(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  wheelAngle: number,
  scale = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  // Shadow
  ctx.fillStyle = "rgba(2, 6, 23, 0.45)";
  ctx.beginPath();
  ctx.ellipse(0, 12, 24, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tender Body (x = -20 to +20, y = -10 to +5)
  const bodyGrad = ctx.createLinearGradient(0, -10, 0, 5);
  bodyGrad.addColorStop(0, "#1e1b4b");
  bodyGrad.addColorStop(0.3, "#312e81");
  bodyGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-20, -10, 40, 15, [2, 2, 1, 1]);
  ctx.fill();

  // Gold side pinstripes
  ctx.strokeStyle = "rgba(251, 191, 36, 0.65)";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(-18, -6, 36, 8);

  // Glowing Quantum Energy Payload (Top open compartment)
  ctx.save();
  const pulse = Math.sin(performance.now() * 0.004) * 0.2 + 0.8;
  const energyGrad = ctx.createRadialGradient(0, -11, 2, 0, -11, 16);
  energyGrad.addColorStop(0, `rgba(45, 212, 170, ${0.95 * pulse})`);
  energyGrad.addColorStop(0.5, `rgba(99, 102, 241, ${0.7 * pulse})`);
  energyGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = energyGrad;
  ctx.beginPath();
  ctx.arc(0, -11, 14, Math.PI, 0, false);
  ctx.fill();

  // Energy crystal facets
  ctx.fillStyle = "#5eead4";
  [-8, -2, 5].forEach((cx, idx) => {
    ctx.beginPath();
    ctx.moveTo(cx, -10);
    ctx.lineTo(cx + 3, -15 - (idx % 2) * 2);
    ctx.lineTo(cx + 6, -10);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();

  // Tender Bogies: 4 wheels at x = -13, -5, +5, +13, y = 8.5
  [-13, -5, 5, 13].forEach((wx) => {
    drawSmallWheel(ctx, wx, 8.5, wheelAngle * 1.5);
  });

  // Coupler bars (front and rear)
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 2);
  ctx.lineTo(25, 2);
  ctx.moveTo(-20, 2);
  ctx.lineTo(-25, 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws Coach 1: Physics Laboratory Coach (warm windows, chalkboard, atom).
 */
export function drawCoach1(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  wheelAngle: number,
  scale = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  // Shadow
  ctx.fillStyle = "rgba(2, 6, 23, 0.45)";
  ctx.beginPath();
  ctx.ellipse(0, 13, 38, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Coach Body (x = -36 to +36, y = -16 to +6)
  const coachGrad = ctx.createLinearGradient(0, -16, 0, 6);
  coachGrad.addColorStop(0, "#312e81");
  coachGrad.addColorStop(0.3, "#4338ca");
  coachGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = coachGrad;
  ctx.beginPath();
  ctx.roundRect(-36, -16, 72, 22, [3, 3, 1, 1]);
  ctx.fill();

  // Roof curve with ribbed texture
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.roundRect(-37, -19, 74, 4, 2);
  ctx.fill();

  // 4 Arched Glowing Windows
  const winPositions = [-26, -9, 8, 25];
  winPositions.forEach((wx, idx) => {
    const winGrad = ctx.createRadialGradient(wx, -8, 1, wx, -8, 6);
    winGrad.addColorStop(0, "rgba(254, 240, 138, 0.95)");
    winGrad.addColorStop(0.7, "rgba(245, 158, 11, 0.75)");
    winGrad.addColorStop(1, "rgba(180, 83, 9, 0.4)");
    ctx.fillStyle = winGrad;
    ctx.beginPath();
    ctx.roundRect(wx - 6, -13, 12, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Inside window details:
    if (idx === 1) {
      // Little glowing atom orbital inside second window!
      ctx.save();
      ctx.strokeStyle = "rgba(20, 184, 138, 0.85)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(wx, -8.5, 3.5, 1.4, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#14b88a";
      ctx.beginPath();
      ctx.arc(wx, -8.5, 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (idx === 2) {
      // Student silhouette
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.beginPath();
      ctx.arc(wx, -9.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Gold Coach Trim line & Nameplate
  ctx.strokeStyle = "rgba(251, 191, 36, 0.7)";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(-33, 0.5, 66, 3.5);

  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 3.2px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PHYSICS PEP TALK • PUC EXPRESS", 0, 3.2);

  // 4 Bogie Wheels (2 trucks: left at x = -24..-14, right at x = 14..24)
  [-24, -14, 14, 24].forEach((wx) => {
    drawSmallWheel(ctx, wx, 9.5, wheelAngle * 1.5);
  });

  // Couplers
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(36, 3);
  ctx.lineTo(41, 3);
  ctx.moveTo(-36, 3);
  ctx.lineTo(-41, 3);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws Coach 2: Observation Caboose with rounded rear dome, red marker lights, and railings.
 */
export function drawCoach2(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  wheelAngle: number,
  scale = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  // Shadow
  ctx.fillStyle = "rgba(2, 6, 23, 0.45)";
  ctx.beginPath();
  ctx.ellipse(0, 13, 38, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body: Front is at +36, rear rounded observation deck is at -36
  const coachGrad = ctx.createLinearGradient(0, -16, 0, 6);
  coachGrad.addColorStop(0, "#312e81");
  coachGrad.addColorStop(0.3, "#4338ca");
  coachGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = coachGrad;
  ctx.beginPath();
  // Round left rear (observation tail)
  ctx.roundRect(-36, -16, 72, 22, [8, 2, 2, 8]);
  ctx.fill();

  // Roof
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.roundRect(-37, -19, 74, 4, [6, 2, 2, 6]);
  ctx.fill();

  // Windows
  const winPositions = [-16, 0, 16];
  winPositions.forEach((wx) => {
    const winGrad = ctx.createRadialGradient(wx, -8, 1, wx, -8, 6);
    winGrad.addColorStop(0, "rgba(254, 240, 138, 0.95)");
    winGrad.addColorStop(0.7, "rgba(245, 158, 11, 0.75)");
    winGrad.addColorStop(1, "rgba(180, 83, 9, 0.4)");
    ctx.fillStyle = winGrad;
    ctx.beginPath();
    ctx.roundRect(wx - 6, -13, 12, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });

  // Observation Tail: Rear curved glass window (x = -32 to -25)
  ctx.save();
  ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
  ctx.beginPath();
  ctx.ellipse(-30, -8, 4, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Rear Brass Observation Railing
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-36, 1);
  ctx.lineTo(-38, 1);
  ctx.lineTo(-38, -6);
  ctx.lineTo(-36, -6);
  ctx.stroke();

  // Dual Ruby-Red Glowing Marker Lights at the rear (-36)
  [-4, 2].forEach((ly) => {
    ctx.save();
    ctx.fillStyle = "#ef4444";
    ctx.shadowColor = "#f43f5e";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-37, ly, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Wheels
  [-22, -12, 14, 24].forEach((wx) => {
    drawSmallWheel(ctx, wx, 9.5, wheelAngle * 1.5);
  });

  // Coupler at front
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(36, 3);
  ctx.lineTo(41, 3);
  ctx.stroke();

  ctx.restore();
}

/**
 * Updates and renders all active steam/smoke particles.
 */
export function updateAndDrawSteam(
  ctx: CanvasRenderingContext2D,
  particles: SteamParticle[],
  dt: number
): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy -= 18 * dt; // Buoyant lift
    p.vx *= Math.pow(0.92, dt * 60); // Air drag
    p.radius += (p.maxRadius - p.radius) * (2.8 * dt);
    p.alpha -= 0.65 * dt;
    p.spin += p.spinSpeed * dt;

    if (p.alpha <= 0.01) {
      particles.splice(i, 1);
      continue;
    }

    // Render soft realistic cloud puff
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.spin);

    const grad = ctx.createRadialGradient(0, 0, p.radius * 0.15, 0, 0, p.radius);
    if (p.isWhistle) {
      grad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha * 0.95})`);
      grad.addColorStop(0.5, `rgba(224, 231, 255, ${p.alpha * 0.65})`);
      grad.addColorStop(1, "rgba(224, 231, 255, 0)");
    } else {
      grad.addColorStop(0, `rgba(241, 245, 249, ${p.alpha * 0.75})`);
      grad.addColorStop(0.5, `rgba(165, 180, 252, ${p.alpha * 0.35})`);
      grad.addColorStop(1, "rgba(99, 102, 241, 0)");
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Updates and renders track contact spark particles.
 */
export function updateAndDrawSparks(
  ctx: CanvasRenderingContext2D,
  sparks: SparkParticle[],
  dt: number
): void {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 60 * dt; // Gravity
    s.alpha -= 1.8 * dt;

    if (s.alpha <= 0.01) {
      sparks.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.fillStyle = s.color;
    ctx.globalAlpha = Math.max(0, s.alpha);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Renders floating reaction / speech comic bubbles above the train.
 */
export function updateAndDrawBubbles(
  ctx: CanvasRenderingContext2D,
  bubbles: FloatingBubble[],
  dt: number,
  canvasWidth = 1000,
  scale = 1
): void {
  const isMobile = scale < 0.65;
  const fontSize = isMobile ? 11 : 12.5;
  const bubbleHeight = isMobile ? 24 : 28;
  const padX = isMobile ? 10 : 14;

  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.y += b.vy * dt;
    b.alpha -= 0.28 * dt;

    if (b.alpha <= 0.01) {
      bubbles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, b.alpha));
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;

    const textWidth = ctx.measureText(b.text).width;
    const maxAllowedWidth = Math.max(160, canvasWidth - 28);
    const w = Math.min(maxAllowedWidth, textWidth + padX * 2);
    const h = bubbleHeight;

    // Clamp horizontally within screen edges
    const bx = Math.max(10, Math.min(canvasWidth - w - 10, b.x - w / 2));
    const by = b.y - h;

    // Glassmorphic bubble background
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.strokeStyle = "rgba(99, 102, 241, 0.9)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 7);
    ctx.fill();
    ctx.stroke();

    // Little pointer arrow clamped to bubble bottom
    const arrowX = Math.max(bx + 12, Math.min(bx + w - 12, b.x));
    ctx.beginPath();
    ctx.moveTo(arrowX - 4, by + h);
    ctx.lineTo(arrowX, by + h + 5);
    ctx.lineTo(arrowX + 4, by + h);
    ctx.closePath();
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.fill();
    ctx.stroke();

    // Bubble Text with glow
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.text, bx + w / 2, by + h / 2, w - 8);

    ctx.restore();
  }
}
