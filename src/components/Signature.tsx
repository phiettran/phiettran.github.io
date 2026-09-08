"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

/* Geometry of the signature, in viewBox units. */
const PAD = 28;
const BASE = 165; // baseline
const RISE = 62; // top of the pen's travel
const DIP = 205; // bottom of the pen's travel
const HEIGHT = 250;
const FONT_SIZE = 128;
const DURATION = 2.9; // seconds, kept in sync with globals.css
const DELAY = 0.35;

/**
 * Builds the pen's route across the name: one rise-and-dip loop per
 * character, strung into a single continuous path. This is never drawn —
 * it is stroked inside a mask, so the name is revealed in the order and
 * direction a hand would actually move, rather than wiped left to right.
 */
function buildGuide(text: string, advance: number) {
  let d = `M ${PAD},${BASE}`;

  [...text].forEach((char, i) => {
    const x = PAD + i * advance;
    const next = x + advance;

    if (char === " ") {
      d += ` L ${next},${BASE}`;
      return;
    }

    d +=
      ` C ${x + advance * 0.12},${BASE - 30} ${x + advance * 0.24},${RISE + 25} ${x + advance * 0.4},${RISE}` +
      ` C ${x + advance * 0.56},${RISE + 35} ${x + advance * 0.6},${DIP - 30} ${x + advance * 0.52},${DIP}` +
      ` C ${x + advance * 0.68},${DIP - 15} ${next - advance * 0.12},${BASE + 18} ${next},${BASE}`;
  });

  return d;
}

export default function Signature({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [run, setRun] = useState(0);
  const [inkWidth, setInkWidth] = useState<number | null>(null);
  const textRef = useRef<SVGTextElement>(null);
  const uid = useId().replace(/:/g, "");

  /* The guide and the mask have to span the real rendered text, not an
     estimate — otherwise a wide name runs off the end of both and the
     last letters never get revealed. Measure once the webfont is ready,
     since fallback metrics would give the wrong width. */
  const measure = () => {
    const el = textRef.current;
    if (el) setInkWidth(el.getComputedTextLength());
  };

  useLayoutEffect(measure, [text]);

  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [text]);

  const advance = (inkWidth ?? text.length * 52) / text.length;
  const width = PAD * 2 + advance * text.length;
  const guide = buildGuide(text, advance);
  const maskId = `sig-mask-${uid}`;
  const pathId = `sig-path-${uid}`;

  return (
    <button
      type="button"
      onClick={() => setRun((n) => n + 1)}
      aria-label={`${text} — write it again`}
      title="write it again"
      className={`block w-full cursor-pointer bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-4 focus-visible:ring-offset-cream ${className}`}
    >
      <svg
        viewBox={`0 0 ${width} ${HEIGHT}`}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={text}
      >
        <defs>
          <path id={pathId} d={guide} fill="none" />
          <mask id={maskId} maskUnits="userSpaceOnUse">
            {/* Generous bounds so ascenders, descenders and the final
                letter are never cut off by the mask itself. */}
            <rect
              x={-PAD}
              y={-HEIGHT}
              width={width + PAD * 2}
              height={HEIGHT * 3}
              fill="black"
            />
            <path
              key={`reveal-${run}-${inkWidth ?? 0}`}
              className="sig-reveal"
              d={guide}
              fill="none"
              stroke="white"
              strokeWidth={58}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
            />
          </mask>
        </defs>

        <text
          ref={textRef}
          x={PAD}
          y={BASE}
          mask={`url(#${maskId})`}
          fill="currentColor"
          className="font-script"
          fontSize={FONT_SIZE}
        >
          {text}
        </text>

        {/* The nib, riding the same route the reveal follows. */}
        <circle
          key={`nib-${run}-${inkWidth ?? 0}`}
          className="sig-nib"
          r={5}
          fill="var(--color-navy)"
          opacity={0}
        >
          <animateMotion
            dur={`${DURATION}s`}
            begin={`${DELAY}s`}
            fill="freeze"
            keyPoints="0;1"
            keyTimes="0;1"
            calcMode="spline"
            keySplines="0.5 0.05 0.35 1"
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;0.85;0.85;0"
            keyTimes="0;0.04;0.9;1"
            dur={`${DURATION}s`}
            begin={`${DELAY}s`}
            fill="freeze"
          />
        </circle>
      </svg>
    </button>
  );
}
