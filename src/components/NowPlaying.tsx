"use client";

import { useEffect, useState } from "react";
import { spotify } from "@/content/site";

/* The shape the Worker hands back — already flattened, so a podcast
   episode and a song look the same by the time they get here. */
type Track = {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  url: string | null;
  durationMs: number | null;
  progressMs: number | null;
  playedAt: string | null;
};

/* The progress meter is drawn as discrete cells rather than a smooth bar,
   to rhyme with the particle grid the name is sampled onto. */
const SEGMENTS = 26;

/* 154_000 -> "2:34" */
function clock(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/* "4m ago", "2h ago", "yesterday" — the exact minute is never the point. */
function sinceLabel(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

function SpotifyGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

export default function NowPlaying({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const [track, setTrack] = useState<Track | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!spotify.endpoint) return;

    // A fetch in flight when the component unmounts must not write stale
    // state over fresh state.
    let alive = true;
    const controller = new AbortController();
    let timer: ReturnType<typeof setInterval> | undefined;

    async function load() {
      try {
        const res = await fetch(spotify.endpoint, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (alive && data?.title) {
          setTrack(data);
          // Seeded here rather than in the ticking effect below: React 19
          // rejects a synchronous setState in an effect body.
          setElapsed(data.progressMs ?? 0);
        }
      } catch {
        // Offline, blocked, or the Worker is down. Keep whatever is on
        // screen rather than flashing an error into the layout.
      }
    }

    /* A backgrounded tab has nobody looking at it, so polling it is pure
       waste — of the Worker's request budget and of the visitor's battery.
       Poll only while the tab is actually in front, and refresh once on the
       way back so the card is never visibly stale. */
    function start() {
      if (timer) return;
      load();
      timer = setInterval(load, spotify.pollSeconds * 1000);
    }
    function stop() {
      clearInterval(timer);
      timer = undefined;
    }
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      controller.abort();
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /* The Worker is only polled every 30s, so a meter driven straight off
     `progressMs` would sit frozen and then jump. Advance it locally off the
     wall clock between polls; each poll then resyncs the true position. */
  useEffect(() => {
    if (!track?.isPlaying || track.progressMs == null) return;

    const base = track.progressMs;
    const startedAt = Date.now();
    const cap = track.durationMs ?? Number.POSITIVE_INFINITY;

    const id = setInterval(
      () => setElapsed(Math.min(base + (Date.now() - startedAt), cap)),
      1000,
    );
    return () => clearInterval(id);
  }, [track]);

  /* Nothing to show yet — and nothing to show ever, if the endpoint is
     unset or the Worker is unreachable. Rendering null removes the card
     from the pile entirely rather than leaving a blank frame in it. */
  if (!track) return null;

  const pct =
    track.isPlaying && track.durationMs
      ? Math.min(100, (elapsed / track.durationMs) * 100)
      : 0;
  const lit = Math.round((pct / 100) * SEGMENTS);

  const card = (
    <div className="tech-card px-4 py-3.5">
      {/* status line */}
      <div className="flex items-center gap-2">
        <SpotifyGlyph className="h-3.5 w-3.5 shrink-0 text-spotify" />
        <p className="chrome text-[0.7rem] tracking-wide text-muted">
          {track.isPlaying
            ? "now playing"
            : track.playedAt
              ? `last played · ${sinceLabel(track.playedAt)}`
              : "last played"}
        </p>
        {track.isPlaying && (
          <span className="eq ml-auto" aria-hidden="true">
            <i /><i /><i />
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3.5">
        {track.albumArt && (
          /* Plain <img>: the host is Spotify's CDN, which changes per track,
             and next/image is unoptimized in this export anyway. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.albumArt}
            alt={track.album ? `${track.album} cover art` : ""}
            width={240}
            height={240}
            loading="lazy"
            className="h-[5.25rem] w-[5.25rem] shrink-0 rounded-[3px] border border-line object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-[1.02rem] leading-snug font-medium text-ink">
            {track.title}
          </p>
          <p className="truncate text-[0.85rem] leading-snug text-muted">
            {track.artist}
          </p>
          {/* Album and runtime share a line — on two they left the card
              looking half-empty. */}
          <p className="chrome truncate text-[0.7rem] text-steel">
            {[track.album !== track.title ? track.album : null,
              !track.isPlaying && track.durationMs ? clock(track.durationMs) : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {/* The whole card is the link, so this is the affordance for it — not
            a transport control. Nothing here can drive my playback, and a
            button that pretended to would be a dead control. */}
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-cream transition-transform duration-300 group-hover:scale-110"
          title={track.isPlaying ? "play on spotify" : "open on spotify"}
        >
          <svg viewBox="0 0 24 24" className="ml-0.5 h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>

      {/* Segmented meter, but only while something is actually playing —
          a filled bar on a finished track would be inventing a position. */}
      {track.isPlaying && track.durationMs && (
        <div className="mt-3.5">
          <div className="flex items-end gap-[2px]" aria-hidden="true">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span
                key={i}
                className={`h-2 flex-1 rounded-[1px] transition-colors duration-300 ${
                  i < lit ? "bg-spotify" : "bg-mist"
                }`}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[0.68rem] tabular-nums text-steel">
            <span>{clock(elapsed)}</span>
            <span>{clock(track.durationMs)}</span>
          </div>
        </div>
      )}
    </div>
  );

  if (!track.url) {
    return (
      <div className={className} style={style}>
        {card}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <a
        href={track.url}
        target="_blank"
        rel="noreferrer"
        className="group block rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        aria-label={`${track.title} by ${track.artist} — open on Spotify`}
      >
        {card}
      </a>
    </div>
  );
}
