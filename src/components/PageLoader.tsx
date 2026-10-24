/**
 * PageLoader.tsx
 *
 * Full-screen 3D loading screen + page-entrance transition.
 * Matches the dark futuristic design system (indigo/teal, grid bg, particles).
 *
 * Usage:
 *   <PageLoader label="Faculties" icon="atom">
 *     {actualPageContent}
 *   </PageLoader>
 *
 * Props
 *   label   — shown under the spinner  e.g. "Faculties" | "Blog" | "Article"
 *   icon    — which 3D graphic to spin: "atom" | "dna" | "book"
 *   children — page content; rendered after loader fades out
 */

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LoaderIcon = "atom" | "dna" | "book";

interface PageLoaderProps {
  label: string;
  icon?: LoaderIcon;
  children: React.ReactNode;
}

// ─── 3D Atom / Orbiting-Rings graphic ────────────────────────────────────────

function AtomGraphic() {
  return (
    <div className="loader-atom" aria-hidden="true">
      {/* Nucleus */}
      <div className="loader-nucleus">
        <div className="loader-nucleus-core" />
        <div className="loader-nucleus-pulse" />
        <div className="loader-nucleus-pulse delay-1" />
      </div>
      {/* Three orbital rings, each tilted differently */}
      <div className="loader-ring ring-1">
        <div className="loader-electron" />
      </div>
      <div className="loader-ring ring-2">
        <div className="loader-electron" />
      </div>
      <div className="loader-ring ring-3">
        <div className="loader-electron" />
      </div>
    </div>
  );
}

// ─── 3D DNA helix graphic ─────────────────────────────────────────────────────

function DnaGraphic() {
  const PAIRS = 8;
  return (
    <div className="loader-dna" aria-hidden="true">
      {Array.from({ length: PAIRS }).map((_, i) => (
        <div
          key={i}
          className="loader-dna-pair"
          style={{ "--pair-i": i } as React.CSSProperties}
        >
          <div className="loader-dna-node left"  />
          <div className="loader-dna-rung"       />
          <div className="loader-dna-node right" />
        </div>
      ))}
    </div>
  );
}

// ─── 3D open-book graphic ─────────────────────────────────────────────────────

function BookGraphic() {
  return (
    <div className="loader-book" aria-hidden="true">
      <div className="loader-book-cover left" />
      <div className="loader-book-spine" />
      <div className="loader-book-cover right" />
      {/* "pages" lines */}
      {[1,2,3,4,5].map((n) => (
        <div key={n} className="loader-book-page" style={{ "--page-i": n } as React.CSSProperties} />
      ))}
      {/* glow orb above */}
      <div className="loader-book-orb" />
    </div>
  );
}

// ─── Floating mini-particles inside loader ────────────────────────────────────

function LoaderParticles() {
  return (
    <div className="loader-particles" aria-hidden="true">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="loader-particle"
          style={{
            "--lp-x":  `${(i * 37 + 11) % 100}%`,
            "--lp-delay": `${(i * 0.31) % 3}s`,
            "--lp-dur":   `${2.4 + (i % 5) * 0.4}s`,
            "--lp-size":  `${2 + (i % 3)}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── Animated text progress ───────────────────────────────────────────────────

const LOADING_PHRASES = [
  "Initialising systems…",
  "Loading resources…",
  "Preparing content…",
  "Almost there…",
  "Ready!",
];

function LoadingText({ progress }: { progress: number }) {
  const idx = Math.min(
    Math.floor((progress / 100) * (LOADING_PHRASES.length - 1)),
    LOADING_PHRASES.length - 1,
  );
  return (
    <p className="loader-phrase" key={idx}>
      {LOADING_PHRASES[idx]}
    </p>
  );
}

// ─── Main PageLoader ──────────────────────────────────────────────────────────

export function PageLoader({ label, icon = "atom", children }: PageLoaderProps) {
  const [progress, setProgress]     = useState(0);
  const [exiting, setExiting]       = useState(false);
  const [done, setDone]             = useState(false);
  const rafRef                      = useRef<number>(0);
  const startRef                    = useRef<number>(0);

  useEffect(() => {
    // Drive a realistic-feeling progress curve:
    //   fast at first (0→70 in ~400ms), then slow (70→95), snap to 100 and exit
    const DURATION = 1600; // ms until 95%
    const HOLD_AT  = 95;   // pause here briefly before snapping to 100

    let snapped = false;

    function tick(now: number) {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      // ease-out-expo curve
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const p = Math.round(eased * HOLD_AT);
      setProgress(p);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!snapped) {
        snapped = true;
        setTimeout(() => {
          setProgress(100);
          setTimeout(() => {
            setExiting(true);
            setTimeout(() => setDone(true), 600); // wait for exit anim
          }, 250);
        }, 180);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const Graphic = icon === "dna" ? DnaGraphic : icon === "book" ? BookGraphic : AtomGraphic;

  return (
    <>
      {/* ── Loading screen ───────────────────────────────────────────── */}
      {!done && (
        <div className={`page-loader ${exiting ? "exiting" : ""}`} aria-live="polite" aria-label={`Loading ${label}`}>
          {/* Grid background (matches map-bg) */}
          <div className="loader-map-bg" aria-hidden="true" />

          {/* Floating particles */}
          <LoaderParticles />

          {/* Centre stage */}
          <div className="loader-stage">

            {/* 3-D graphic */}
            <div className="loader-graphic-wrap">
              <Graphic />
            </div>

            {/* Brand label */}
            <div className="loader-brand">
              <span className="loader-brand-tag">Physics Pep Talk</span>
              <h2 className="loader-title">{label}</h2>
            </div>

            {/* Progress bar */}
            <div className="loader-progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="loader-progress-fill"
                style={{ "--loader-prog": `${progress}%` } as React.CSSProperties}
              />
              {/* Glow bead at the tip */}
              <div
                className="loader-progress-bead"
                style={{ left: `calc(${progress}% - 4px)` }}
              />
            </div>

            {/* Percentage + phrase */}
            <div className="loader-meta">
              <span className="loader-pct">{progress}%</span>
              <LoadingText progress={progress} />
            </div>

          </div>

          {/* Corner brackets decoration */}
          <div className="loader-corner tl" aria-hidden="true" />
          <div className="loader-corner tr" aria-hidden="true" />
          <div className="loader-corner bl" aria-hidden="true" />
          <div className="loader-corner br" aria-hidden="true" />
        </div>
      )}

      {/* ── Page content — fades in after loader exits ───────────────── */}
      <div className={`page-enter ${done ? "page-enter-active" : ""}`}>
        {children}
      </div>
    </>
  );
}
