# spotify now-playing worker

The portfolio is a static export on GitHub Pages, so it has no server —
and Spotify's token exchange needs a client secret that must never reach
the browser. This Worker is that server. It holds the credentials, mints
short-lived access tokens, and returns a small JSON blob with no secrets
in it.

Setup is four steps and only has to happen once.

## 1. create the Spotify app

At <https://developer.spotify.com/dashboard> → **Create app**.

Add this exact redirect URI (Spotify requires the literal IP, not
`localhost`):

```
http://127.0.0.1:8888/callback
```

Copy the **Client ID** and **Client Secret**.

## 2. get a refresh token

From the repo root:

```bash
node scripts/spotify-auth.mjs <client-id> <client-secret>
```

Open the URL it prints, approve, and it prints a refresh token. This
token does not expire — the Worker trades it for a fresh access token on
every cold start.

## 3. deploy the worker

```bash
cd worker
npm install
npx wrangler login

npx wrangler secret put SPOTIFY_CLIENT_ID
npx wrangler secret put SPOTIFY_CLIENT_SECRET
npx wrangler secret put SPOTIFY_REFRESH_TOKEN

npx wrangler deploy
```

`wrangler deploy` prints the public URL, e.g.
`https://spotify-now-playing.<your-subdomain>.workers.dev`.

Then edit `ALLOWED_ORIGINS` in `wrangler.toml` to your site's origin (and
your custom domain, comma-separated, if you have one) and deploy again.
That header is what stops other sites from reading your endpoint.

## 4. point the site at it

The URL is public, not a secret. Either:

- put it in `NEXT_PUBLIC_SPOTIFY_ENDPOINT` under **Settings → Secrets and
  variables → Actions → Variables** (the deploy workflow already reads
  it), or
- paste it straight into the `spotify.endpoint` literal in
  `src/content/site.ts`.

Locally, `echo 'NEXT_PUBLIC_SPOTIFY_ENDPOINT=https://...' > .env.local`.

Until the endpoint is set the card renders nothing, so the site is never
broken mid-setup.

## behaviour

- Playing something → live card with album art, a bouncing equaliser, and
  a progress bar.
- Not playing → falls back to the last finished track with a relative
  timestamp ("last played · 20m ago").
- Worker down, offline, or endpoint unset → the card removes itself from
  the about pile entirely.

The browser re-checks every 30s (`spotify.pollSeconds`). The Worker
edge-caches for 20s, so many simultaneous readers cost roughly one
Spotify call, well inside the free tier.
