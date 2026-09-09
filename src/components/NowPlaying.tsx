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

export default function NowPlaying({ className }: { className?: string }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!spotify.endpoint) return;

    // A fetch in flight when the component unmounts (or when the next poll
    // fires) must not write stale state over fresh state.
    let alive = true;
    const controller = new AbortController();

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

    load();
    const id = setInterval(load, spotify.pollSeconds * 1000);

    return () => {
      alive = false;
      controller.abort();
      clearInterval(id);
    };
  }, []);

  /* The Worker is only polled every 30s, so a bar driven straight off
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
     unset or the Worker is unreachable. Rendering null drops the whole
     column so the pile beside it simply takes the full width. */
  if (!track) return null;

  const pct =
    track.isPlaying && track.durationMs
      ? Math.min(100, (elapsed / track.durationMs) * 100)
      : 0;

  const card = (
    <div className="rounded-[var(--radius-soft)] border border-line bg-shell p-4 shadow-soft transition-shadow duration-300 group-hover:shadow-lift sm:p-5">
      {/* status line */}
      <div className="flex items-center gap-2">
        <SpotifyGlyph className="h-4 w-4 shrink-0 text-spotify" />
        <p className="chrome text-xs text-muted">
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

      {/* album art — the anchor of the card */}
      {track.albumArt && (
        /* Plain <img>: the host is Spotify's CDN, which changes per track,
           and next/image is unoptimized in this export anyway. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.albumArt}
          alt={track.album ? `${track.album} cover art` : ""}
          width={400}
          height={400}
          loading="lazy"
          className="mt-4 aspect-square w-full rounded-xl border border-line object-cover shadow-soft"
        />
      )}

      <div className="mt-4">
        <p className="truncate text-lg leading-snug font-medium text-ink">
          {track.title}
        </p>
        <p className="truncate text-sm leading-snug text-muted">{track.artist}</p>
        {track.album && track.album !== track.title && (
          <p className="chrome mt-0.5 truncate text-xs text-steel">{track.album}</p>
        )}
      </div>

      {/* Scrubber, but only while something is actually playing — a static
          bar on a finished track would be inventing a position. */}
      {track.isPlaying && track.durationMs ? (
        <div className="mt-4">
          <div className="h-1 w-full overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-spotify transition-[width] duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="chrome mt-1.5 flex justify-between text-[0.7rem] tabular-nums text-steel">
            <span>{clock(elapsed)}</span>
            <span>{clock(track.durationMs)}</span>
          </div>
        </div>
      ) : (
        track.durationMs && (
          <p className="chrome mt-4 text-[0.7rem] tabular-nums text-steel">
            {clock(track.durationMs)}
          </p>
        )
      )}

      {/* The whole card is the link, so this is the affordance for it — not
          a transport control. Nothing here can drive my playback, and a
          button that pretended to would be a dead control. */}
      <div className="mt-4 flex items-center gap-2.5 border-t border-line pt-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-cream transition-transform duration-300 group-hover:scale-105">
          <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="chrome text-sm text-muted transition-colors group-hover:text-ink">
          {track.isPlaying ? "play on spotify" : "open on spotify"}
        </span>
      </div>
    </div>
  );

  if (!track.url) return <div className={className}>{card}</div>;

  return (
    <div className={className}>
      <a
        href={track.url}
        target="_blank"
        rel="noreferrer"
        className="group block rounded-[var(--radius-soft)] outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        aria-label={`${track.title} by ${track.artist} — open on Spotify`}
      >
        {card}
      </a>
    </div>
  );
}
