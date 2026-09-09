/* ============================================================
   Spotify "now playing" proxy.

   The portfolio is a static export on GitHub Pages, so it has no
   server of its own — and Spotify's token exchange needs a client
   secret that must never reach the browser. This Worker is that
   server: it holds the secret, mints short-lived access tokens
   from a long-lived refresh token, and hands the site back a small
   normalised JSON blob with no credentials in it.
   ============================================================ */

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode";
const RECENT_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

/* Access tokens last an hour. Workers keep an isolate warm between
   requests, so caching it here saves a round trip to Spotify on most
   hits. Losing it costs one extra request, never correctness. */
let cachedToken = null; // { value, expiresAt }

async function getAccessToken(env) {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const basic = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    // Retire it a minute early so a token never expires mid-flight.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

/* Spotify's shapes differ between a track and a podcast episode, and
   between "playing now" and "played earlier". Flatten all of it here so
   the front end only ever sees one shape. */
function normalise(item, { isPlaying, progressMs, playedAt }) {
  if (!item) return null;

  const isEpisode = item.type === "episode";
  const images = isEpisode
    ? item.images ?? item.show?.images ?? []
    : item.album?.images ?? [];

  return {
    isPlaying,
    title: item.name ?? "",
    artist: isEpisode
      ? item.show?.name ?? ""
      : (item.artists ?? []).map((a) => a.name).join(", "),
    album: isEpisode ? item.show?.name ?? "" : item.album?.name ?? "",
    // Spotify sorts images largest-first; the card is small, so take the
    // smallest one that is still at least 200px wide.
    albumArt: [...images].sort((a, b) => a.width - b.width).find((i) => i.width >= 200)?.url
      ?? images[images.length - 1]?.url
      ?? null,
    url: item.external_urls?.spotify ?? null,
    durationMs: item.duration_ms ?? null,
    progressMs: progressMs ?? null,
    playedAt: playedAt ?? null,
  };
}

async function readSpotify(env) {
  const token = await getAccessToken(env);
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const live = await fetch(NOW_PLAYING_URL, auth);

  // 204 means the player is idle; 202 means Spotify is still waking it up.
  if (live.status === 200) {
    const data = await live.json();
    if (data?.item && data.is_playing) {
      return normalise(data.item, {
        isPlaying: true,
        progressMs: data.progress_ms,
      });
    }
  }

  // Nothing playing — fall back to the last thing that finished, so the
  // card always has something to say.
  const recent = await fetch(RECENT_URL, auth);
  if (!recent.ok) return null;

  const data = await recent.json();
  const entry = data?.items?.[0];
  if (!entry) return null;

  return normalise(entry.track, {
    isPlaying: false,
    playedAt: entry.played_at,
  });
}

function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS ?? "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = request.headers.get("Origin") ?? "";

  const allow = allowed.includes("*")
    ? "*"
    : allowed.includes(origin)
      ? origin
      : allowed[0] ?? "*";

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  };
}

export default {
  async fetch(request, env, ctx) {
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "GET") {
      return new Response("method not allowed", { status: 405, headers: cors });
    }

    /* Edge-cache the payload briefly. The site polls every 30s and may have
       many readers at once; without this each one would hit Spotify and eat
       into the rate limit. */
    const cache = caches.default;
    const cacheKey = new Request(new URL(request.url).origin + "/__spotify", request);
    const hit = await cache.match(cacheKey);
    if (hit) {
      const out = new Response(hit.body, hit);
      Object.entries(cors).forEach(([k, v]) => out.headers.set(k, v));
      return out;
    }

    let body;
    try {
      body = await readSpotify(env);
    } catch (err) {
      // Never surface the reason: it can contain credentials. The card
      // just hides itself when the payload is empty.
      console.error(err);
      return new Response(JSON.stringify({ error: "upstream" }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const res = new Response(JSON.stringify(body ?? { isPlaying: false }), {
      headers: {
        ...cors,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=20",
      },
    });

    ctx.waitUntil(cache.put(cacheKey, res.clone()));
    return res;
  },
};
