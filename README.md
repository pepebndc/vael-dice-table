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
- The Bard's Veil: a built-in synced soundtrack — the Warden picks a mood (Tavern, Battle, Dread…) and every device plays the same track at the same moment. 400+ CC-BY tracks (~23 hours) by Kevin MacLeod, streamed straight from the Internet Archive. No accounts, no API keys, no services

## Run

Open `index.html` in a browser, or serve the folder statically. Fonts and Three.js load from CDNs; everything else is inline.

## Deploy

Static site. Works as-is on Vercel, Netlify, or GitHub Pages. Cross-device sync (`/api/state`) and the Bard's Veil need Vercel with the free **Upstash Redis** integration connected (Vercel dashboard → Storage/Marketplace → Upstash → create a free Redis database → connect to this project → redeploy). Each poll is one MGET and each save one SET, so the 500k-commands/month free tier is roughly 10× a weekly campaign's usage.

## The Bard's Veil (synced soundtrack) — zero setup

No accounts, keys, or dashboards — for the Warden or anyone else.

- The Warden (`?master`) clicks the ♪ chip beside the character tabs and picks a **mood**: Tavern & Hearth, Roads & Wilds, Mystery & Intrigue, Dread & Shadow, Battle, Doom & Dragonfire, Grief & Ashes, Rest & Embers, Courts & Wonder. A shuffled, no-repeat run of tracks starts on their device and is broadcast to the table; when a track ends the next one in that mood follows on its own.
- Players see the chip light up with the track name; one click on **HEAR IT HERE** and their device plays the same track at the same position, following the Warden's pauses, skips, and mood changes. Volume is per-device.
- The library is ~400 tracks (~23 hours) by Kevin MacLeod (incompetech.com), CC BY 4.0, streamed directly from the Internet Archive's public collections — attribution is shown in the popover. The no-repeat shuffle means several sessions before any mood re-sings a verse.
- Sync notes: the Warden's tab is the DJ — keep it open. Broadcast rides the same `/api/state` channel as everything else (a write only on track change/pause/skip plus a 45 s heartbeat).
