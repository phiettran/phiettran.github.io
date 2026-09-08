"use client";

import { useEffect, useRef } from "react";

type Particle = {
  hx: number; // home position
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const GAP = 3; // sampling stride, in device pixels — lower is denser
const DOT = 1.6; // drawn particle size
const RADIUS = 78; // cursor influence radius
const PUSH = 0.55; // how hard the cursor shoves particles
const SPRING = 0.045; // pull back toward home
const FRICTION = 0.86;

export default function ParticleName({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    let raf = 0;
    let dpr = 1;
    let cssW = 0;
    let cssH = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    const styles = getComputedStyle(wrap);
    const rootStyles = getComputedStyle(document.documentElement);
    const inkColor = rootStyles.getPropertyValue("--color-ink").trim() || "#22314a";
    const navyColor = rootStyles.getPropertyValue("--color-navy").trim() || "#37547f";

    /* Rasterise the name once, then keep only the inked pixels as particles.
       Sampling the real font means the letterforms are always correct. */
    function build() {
      if (!wrap || !canvas || !ctx) return;

      cssW = wrap.clientWidth;
      if (cssW === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      const family = styles.fontFamily || "sans-serif";

      // Fit the text to the available width.
      const probe = 100;
      ctx.font = `700 ${probe}px ${family}`;
      const probeWidth = ctx.measureText(text).width;
      const fontSize = Math.min((cssW * 0.96 * probe) / probeWidth, cssW * 0.34);

      cssH = Math.ceil(fontSize * 1.32);
      canvas.width = Math.ceil(cssW * dpr);
      canvas.height = Math.ceil(cssH * dpr);
      canvas.style.height = `${cssH}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `700 ${fontSize * dpr}px ${family}`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000";
      ctx.fillText(text, 0, canvas.height / 2);

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const next: Particle[] = [];
      for (let y = 0; y < canvas.height; y += GAP) {
        for (let x = 0; x < canvas.width; x += GAP) {
          if (data[(y * canvas.width + x) * 4 + 3] > 128) {
            next.push({ hx: x, hy: y, x, y, vx: 0, vy: 0 });
          }
        }
      }
      particles = next;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const r = RADIUS * dpr;
      const rSq = r * r;

      for (const p of particles) {
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < rSq && dSq > 0.01) {
            const d = Math.sqrt(dSq);
            const force = ((r - d) / r) * PUSH;
            p.vx += (dx / d) * force * 14;
            p.vy += (dy / d) * force * 14;
          }
        }

        p.vx += (p.hx - p.x) * SPRING;
        p.vy += (p.hy - p.y) * SPRING;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;

        // Displaced particles glow toward the accent — the "live" look.
        const off = Math.abs(p.x - p.hx) + Math.abs(p.y - p.hy);
        ctx.fillStyle = off > 2 ? navyColor : inkColor;
        ctx.fillRect(p.x, p.y, DOT * dpr, DOT * dpr);
      }

      raf = requestAnimationFrame(draw);
    }

    function drawStatic() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = inkColor;
      for (const p of particles) {
        ctx.fillRect(p.hx, p.hy, DOT * dpr, DOT * dpr);
      }
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) * dpr;
      pointer.y = (e.clientY - rect.top) * dpr;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    }

    function start() {
      build();
      if (reduced) {
        drawStatic();
        return;
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    }

    /* Wait for the webfont: sampling a fallback face would produce
       particles in the wrong shape. */
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) start();
    });

    const ro = new ResizeObserver(() => {
      if (cancelled) return;
      build();
      if (reduced) drawStatic();
    });
    ro.observe(wrap);

    if (!reduced) {
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
      // Leaving the tab mid-hover would otherwise strand the particles
      // wherever they were when the frame loop paused.
      window.addEventListener("blur", onPointerLeave);
      document.addEventListener("visibilitychange", onPointerLeave);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      document.removeEventListener("visibilitychange", onPointerLeave);
    };
  }, [text]);

  return (
    <div ref={wrapRef} className={`font-display w-full ${className}`}>
      {/* The canvas is decorative; the name itself stays real text for
          screen readers and search engines. */}
      <span className="sr-only">{text}</span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block w-full touch-none"
      />
    </div>
  );
}
