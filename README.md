# The Proving of Mount Vael · Dice Table

A self-contained D&D dice table for our Thornback Reaches campaign. One HTML file, no build step.

## Features

- Real 3D dice (Three.js): d4, d6, d8, d10, d12, d20 with physically tumbling rolls
- Character sheets for the party (Paco, Ray, Odinson) with one-click attacks, saves, skills, and initiative
- Advantage / disadvantage on every d20 roll
- Dice always land on their natural faces; flat modifiers shown as a bonus tag
- Multi-dice rolls: attacks throw the d20 alongside their damage dice
- Loose dice pool: gather a handful (2d6+1d8) and cast it
- Per-player roll journals and HP / spell slot / rage trackers, persisted in localStorage
- Crit and fumble flourishes, snowfall, and Mount Vael lore throughout
- The Bard's Veil: the Warden's Spotify (played from their native client) is broadcast to every device — all players see the now-playing bar and can hear the music in sync (track, position, play/pause) with one click, no sign-in required

## Run

Open `index.html` in a browser, or serve the folder statically. Fonts and Three.js load from CDNs; everything else is inline.

## Deploy

Static site. Works as-is on Vercel, Netlify, or GitHub Pages. Cross-device sync (`/api/state`) and the Bard's Veil need Vercel with the free **Upstash Redis** integration connected (Vercel dashboard → Storage/Marketplace → Upstash → create a free Redis database → connect to this project → redeploy). Each poll is one MGET and each save one SET, so the 500k-commands/month free tier is roughly 10× a weekly campaign's usage.

## The Bard's Veil (Spotify sync) — one-time setup

Only the Warden needs any Spotify setup; players never sign into anything.

1. Create an app at <https://developer.spotify.com/dashboard> (any name). Add the deployed table's URL as a **Redirect URI** — exactly `https://<your-domain>/` (shown in the bind panel). The app can stay in Development Mode forever: only the Warden authenticates against it, and the app owner is always allowed — no User Management allowlist needed.
2. Open the table as the Warden (`?master`), paste the app's **Client ID** into the Bard's Veil bar, and hit **BIND SPOTIFY**. That's it — whatever the Warden's native Spotify client plays is now broadcast to the table every few seconds.
3. Players see the now-playing bar automatically. To *hear* it, a player hits **HEAR IT HERE** — a public Spotify embed appears and is steered to the Warden's track, position, and pauses. No OAuth, no allowlist, no Premium. If the player's browser is signed into spotify.com they hear full tracks; otherwise 30-second previews, and the bar nudges them with a sign-in link (hit **⟳ signed in** after logging in to pick up the session).

Notes: the Warden must keep a table tab open (it does the polling; background tabs update more slowly). The Warden's tokens live only in their device's localStorage; nothing secret touches the server.
