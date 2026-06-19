import { put, list } from "@vercel/blob";

// Per-player bundles plus one shared "npcs" bundle the Warden (?master) edits.
const CHARS = new Set(["paco", "ray", "odinson"]);
const SHARED = new Set(["npcs"]);
// Every blob this table can hold — a fixed set, so reads never need list().
const KEYS = ["paco", "ray", "odinson", "npcs"];

// The store's public origin (e.g. https://xxxx.public.blob.vercel-storage.com).
// Cached in module scope across warm invocations so GET costs zero Advanced
// Operations; list() runs at most once per cold start to discover it (or set
// BLOB_BASE_URL to skip even that).
let BASE = process.env.BLOB_BASE_URL ? process.env.BLOB_BASE_URL.replace(/\/+$/, "") : null;

async function ensureBase() {
  if (BASE) return BASE;
  try {
    const { blobs } = await list({ limit: 1 });
    if (blobs && blobs[0]) BASE = new URL(blobs[0].url).origin;
  } catch { /* store empty or unreachable; nothing to read yet */ }
  return BASE;
}

export default async function handler(req, res) {
  const table = String(req.query.table || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40);
  if (!table) return res.status(400).json({ error: "table required" });
  const prefix = `tables/${table}/`;
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const base = await ensureBase();
    const out = {};
    if (base) {
      // Read the fixed set of blobs straight from the CDN — a simple op, not the
      // Advanced Operation that list() bills on every poll.
      await Promise.all(KEYS.map(async (key) => {
        try {
          const r = await fetch(`${base}/${prefix}${key}.json?v=${Date.now()}`, { cache: "no-store" });
          if (r.ok) out[key] = await r.json();
        } catch { /* missing or unreadable blob → skip */ }
      }));
    }
    return res.status(200).json(out);
  }

  if (req.method === "PUT") {
    const { who, bundle } = req.body || {};
    if ((!CHARS.has(who) && !SHARED.has(who)) || !bundle || typeof bundle !== "object") {
      return res.status(400).json({ error: "bad payload" });
    }
    if (JSON.stringify(bundle).length > 100000) {
      return res.status(413).json({ error: "too large" });
    }
    const result = await put(`${prefix}${who}.json`, JSON.stringify(bundle), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    if (!BASE && result && result.url) BASE = new URL(result.url).origin; // learn the base for free
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "method not allowed" });
}
