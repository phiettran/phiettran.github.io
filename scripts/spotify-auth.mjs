#!/usr/bin/env node
/* ============================================================
   One-time helper: turns a Spotify app's client id/secret into the
   long-lived refresh token the Worker needs.

   Run it once, paste the token into `wrangler secret put`, and never
   think about it again. No dependencies — node builtins only.

     node scripts/spotify-auth.mjs <client-id> <client-secret>

   Before running, add this exact redirect URI to your app at
   https://developer.spotify.com/dashboard :

     http://127.0.0.1:8888/callback
   ============================================================ */

import http from "node:http";
import { randomBytes } from "node:crypto";

const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-read-playback-state",
].join(" ");

const clientId = process.argv[2] ?? process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.argv[3] ?? process.env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "usage: node scripts/spotify-auth.mjs <client-id> <client-secret>\n" +
      "   or: set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in the environment",
  );
  process.exit(1);
}

const state = randomBytes(16).toString("hex");

const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
  });

async function exchange(code) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data, null, 2));
  return data.refresh_token;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }

  const error = url.searchParams.get("error");
  if (error) {
    res.writeHead(400, { "Content-Type": "text/plain" }).end(`denied: ${error}`);
    console.error(`\n  authorisation denied: ${error}\n`);
    server.close();
    process.exit(1);
  }

  if (url.searchParams.get("state") !== state) {
    res.writeHead(400, { "Content-Type": "text/plain" }).end("state mismatch");
    console.error("\n  state mismatch — start over.\n");
    server.close();
    process.exit(1);
  }

  try {
    const refreshToken = await exchange(url.searchParams.get("code"));
    res
      .writeHead(200, { "Content-Type": "text/html" })
      .end("<p style='font:16px system-ui'>done — back to your terminal.</p>");

    console.log("\n  refresh token:\n");
    console.log(`    ${refreshToken}\n`);
    console.log("  store it with:\n");
    console.log("    cd worker && npx wrangler secret put SPOTIFY_REFRESH_TOKEN\n");
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" }).end("exchange failed");
    console.error(`\n  token exchange failed:\n${err.message}\n`);
    process.exitCode = 1;
  }

  server.close();
});

server.listen(8888, "127.0.0.1", () => {
  console.log("\n  open this in your browser:\n");
  console.log(`    ${authUrl}\n`);
  console.log("  waiting for the redirect on 127.0.0.1:8888 ...\n");
});
