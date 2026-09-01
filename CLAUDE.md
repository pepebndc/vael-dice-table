# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A self-contained D&D dice table for the "Thornback Reaches" campaign: 3D dice (Three.js), character sheets, a synced soundtrack ("The Bard's Veil"), and a shared sketchboard/mini-map ("The Warden's Chart"). There is no build step, no bundler, no test suite, and no lint config. `package.json` exists only to mark the repo as an ESM module for Vercel.

## Run / develop

- Open `index.html` directly in a browser, or serve the folder statically (`python3 -m http.server`). Fonts and Three.js load from CDNs (import map at the bottom of `index.html`); everything else is inline.
- Cross-device sync only activates when served over http(s) (`SYNC_ON` checks `location.protocol`), and requires the `/api/state` endpoint, so full sync behavior needs `vercel dev` or a deployed Vercel project with the Upstash Redis integration connected (env vars `UPSTASH_REDIS_REST_URL`/`_TOKEN` or `KV_REST_API_URL`/`_TOKEN`).
- Verification is manual: open the page, roll dice, and for sync features open two browser windows (one with `?master` for the Warden view).

## Architecture

Two source files only:

### `index.html` (~3400 lines, everything inline)

Three script blocks:

1. **Main `<script>`** (the bulk): app state and UI, organized roughly top to bottom as:
   - `CHARS`: hardcoded character sheets for the party (paco, ray, odinson). `IS_MASTER` (from `?master` in the URL) gates Warden-only features (bestiary editing, music broadcast, chart drawing).
   - Rollers, trackers (HP, spell slots, rage), roll journal. Per-player state persists in localStorage.
   - **Cross-device sync** (search `cross-device sync`): the core shared mechanism. State is split into named bundles (per-character `paco`/`ray`/`odinson` plus Warden-owned shared bundles `npcs`, `music`, `map`). `markDirty(who)` coalesces edits (1200 ms debounce) into `pushDirty()`, which serializes PUTs one at a time (concurrent PUTs can land out of order). A fixed 6-second poll (`POLL_MS`), paused while the tab is hidden, does the reads. `lastPushedSig` skips writes with unchanged content. Tables are namespaced by `?table=` (default `the-proving`).
   - **The Bard's Veil** (search `BARD_`): ~400-track music library with moods; the Warden's tab is the DJ and broadcasts now-playing over the `music` bundle; other devices follow. Tracks stream from the Internet Archive.
   - **The Warden's Chart** (search `WC_`): shared drawing canvas with up to 8 named charts, grid, emoji pieces, and uploadable background scenes. The `map` bundle in the poll carries only chart metadata (names, grids, `bgv` scene versions, `cv` content versions). Each chart's strokes and stickers live under a separate `mapchart-cN` key, pushed on edit and fetched on demand via `?chart=` when its `cv` moves. A chart body must stay under `WC_MAX_BYTES` (900 KB, headroom under the API's 1 MB per-chart cap). Backgrounds are compressed client-side and stored under separate `mapbg-cN` keys fetched on demand.

2. **`<script type="importmap">`**: pins Three.js to a CDN URL.

3. **`<script type="module">`**: the Three.js dice renderer (geometry, materials, tumble/settle animation). Dice results are computed by the game logic first; the 3D die is animated to land on that predetermined face.

### `api/state.js` (Vercel serverless function)

The entire backend. Talks to Upstash Redis via its REST API with plain `fetch` (no SDK). Key design constraints to preserve:

- Reads are a single `MGET` over the fixed `KEYS` list; saves are a single `SET`. This keeps a weekly campaign well inside Upstash's free tier, so do not add per-request `LIST`/`SCAN` calls or extra commands to the hot path.
- Chart bodies (`mapchart-cN`) and backgrounds (`mapbg-cN`) are deliberately excluded from the poll MGET and fetched via `?chart=` / `?bg=` with long-lived caching, versioned by `cv` / `bgv`.
- Payload caps: 100 KB per poll bundle, 1 MB for chart bodies, 450 KB for backgrounds. The client-side `WC_MAX_BYTES` must stay under the chart-body cap with room for JSON escaping (Upstash's REST request cap is 1 MB).
- Adding a new synced bundle means updating `CHARS`/`SHARED`/`KEYS` in `api/state.js` **and** the client's push/poll logic in `index.html` together.

## Conventions

- Keep the single-file, no-build philosophy: new features go inline in `index.html`.
- The codebase uses campaign-flavored naming throughout (Warden = DM, Veil = sync, Chart = map). Comments and UI copy follow that voice; match it.
- Last-write-wins sync with no auth: the Warden's device is authoritative for shared bundles, players for their own character. Preserve the push serialization and dirty-coalescing behavior when touching sync code.
