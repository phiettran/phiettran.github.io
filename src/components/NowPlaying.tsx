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

/* "4m", "2h", "yesterday" — the exact minute is never the point. */
function sinceLabel(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

/* The pile's rotation/offset styles are computed by About and handed down,
   because this component owns whether the card exists at all — an empty
   wrapper would leave a blank rotated gap in the pile. */
export default function NowPlaying({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const [track, setTrack] = useState<Track | null>(null);

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
        if (alive && data?.title) setTrack(data);
      } catch {
        // Offline, blocked, or the Worker is down. Keep whatever is on
        // screen rather than flashing an error into the pile.
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

  /* Nothing to show yet — and nothing to show ever, if the endpoint is
     unset or the Worker is unreachable. Dropping the wrapper too means the
     pile closes up around it instead of holding an empty rotated card. */
  if (!track) return null;

  const body = (
    <div className="rounded-[var(--radius-soft)] border border-line bg-shell px-5 py-4 shadow-soft">
      <div className="flex items-center gap-2">
        {track.isPlaying ? (
          <span className="eq" aria-hidden="true">
            <i /><i /><i />
          </span>
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-steel" aria-hidden="true" />
        )}
        <p className="chrome text-xs text-muted">
          {track.isPlaying
            ? "now playing"
            : track.playedAt
              ? `last played · ${sinceLabel(track.playedAt)}`
              : "last played"}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {track.albumArt && (
          /* Plain <img>: the host is Spotify's CDN, which changes per
             track, and next/image is unoptimized in this export anyway. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.albumArt}
            alt={track.album ? `${track.album} cover art` : ""}
            width={56}
            height={56}
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="truncate text-[1.05rem] leading-snug font-medium text-ink/85">
            {track.title}
          </p>
          <p className="truncate text-sm leading-snug text-muted">{track.artist}</p>
        </div>
      </div>

      {/* Progress only means anything while something is actually playing. */}
      {track.isPlaying && track.durationMs && track.progressMs != null && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-mist">
          <div
            className="h-full rounded-full bg-navy/60"
            style={{
              width: `${Math.min(100, (track.progressMs / track.durationMs) * 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className={className} style={style} tabIndex={0}>
      {track.url ? (
        <a
          href={track.url}
          target="_blank"
          rel="noreferrer"
          className="block"
          aria-label={`${track.title} by ${track.artist} on Spotify`}
        >
          {body}
        </a>
      ) : (
        body
      )}
    </div>
  );
}
