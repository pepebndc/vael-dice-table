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

## Run

Open `index.html` in a browser, or serve the folder statically. Fonts and Three.js load from CDNs; everything else is inline.

## Deploy

Static site. Works as-is on Vercel, Netlify, or GitHub Pages.
