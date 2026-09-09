"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { projects, type Project } from "@/content/site";
import SectionHead from "./SectionHead";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/* Subscribes to the OS motion setting without setting state in an effect,
   and reports false on the server so markup matches on hydration. */
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(MOTION_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
}

const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

/**
 * Project media can be a still or a clip. Videos autoplay silently and loop
 * so a card reads like an animated preview, but anyone who has asked for
 * reduced motion gets a paused player with controls instead.
 */
function Media({
  src,
  alt,
  fill = false,
  className = "",
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (VIDEO_EXT.test(src)) {
    return (
      <video
        src={src}
        aria-label={alt}
        autoPlay={!reduced}
        loop={!reduced}
        muted
        playsInline
        controls={reduced}
        preload="metadata"
        className={fill ? `absolute inset-0 h-full w-full ${className}` : className}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        className={className}
      />
    );
  }

  return (
    <Image src={src} alt={alt} width={800} height={600} className={className} />
  );
}

export default function Projects() {
  const [active, setActive] = useState<Project | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [active, close]);

  return (
    <section id="work" className="px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHead title="projects" note={`${projects.length} projects`} />

        <div className="mt-9 grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <button
              key={project.slug}
              type="button"
              onClick={() => setActive(project)}
              aria-label={`${project.title} — open details`}
              aria-haspopup="dialog"
              className="group block cursor-pointer overflow-hidden rounded-[var(--radius-soft)] border border-line bg-shell text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/45 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-mist/50">
                <Media
                  src={project.cover}
                  alt={`${project.title} preview`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>

              <div className="p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-2xl">{project.title}</h3>
                  <span className="chrome shrink-0 text-sm text-muted">{project.year}</span>
                </div>

                <p className="mt-2 leading-relaxed text-ink/75">{project.blurb}</p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="chrome rounded-full bg-mist/60 px-3 py-1 text-xs text-ink/70"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>

                <span className="chrome mt-5 inline-block text-sm text-navy opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  have a closer look →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && <Detail project={active} onClose={close} closeRef={closeRef} />}
    </section>
  );
}

function Detail({
  project,
  onClose,
  closeRef,
}: {
  project: Project;
  onClose: () => void;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/25 p-3 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="animate-rise w-full max-w-2xl overflow-hidden rounded-[var(--radius-soft)] border border-line bg-shell shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-line bg-shell/95 px-6 py-4 backdrop-blur-sm">
          <span className="chrome text-sm text-muted">
            {project.role} · {project.year}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="chrome rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors hover:bg-mist/70 hover:text-ink focus:outline-none focus-visible:bg-mist/70 focus-visible:text-ink"
          >
            close
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-[clamp(1.9rem,6vw,3rem)]">{project.title}</h2>

          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="chrome rounded-full bg-mist/60 px-3 py-1 text-xs text-ink/70"
              >
                {tag}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-4">
            {project.description.map((paragraph, i) => (
              <p key={i} className="leading-relaxed text-ink/80">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {project.shots.map((shot, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[calc(var(--radius-soft)-0.3rem)] border border-line"
              >
                <Media
                  src={shot}
                  alt={`${project.title} screenshot ${i + 1}`}
                  className="block h-auto w-full"
                />
              </div>
            ))}
          </div>

          {project.links && project.links.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2.5 border-t border-line pt-6">
              {project.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="chrome inline-block rounded-full bg-navy px-5 py-2.5 text-sm text-shell transition-all hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    {link.label} →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
