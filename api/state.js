import { put, list } from "@vercel/blob";

// Per-player bundles plus one shared "npcs" bundle the Warden (?master) edits.
const CHARS = new Set(["paco", "ray", "odinson"]);
const SHARED = new Set(["npcs"]);

export default async function handler(req, res) {
  const table = String(req.query.table || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40);
  if (!table) return res.status(400).json({ error: "table required" });
  const prefix = `tables/${table}/`;
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const { blobs } = await list({ prefix, limit: 20 });
    const out = {};
    await Promise.all(blobs.map(async (b) => {
      const key = b.pathname.slice(prefix.length).replace(/\.json$/, "");
      try {
        // query param busts the CDN cache so reads are always fresh
        const r = await fetch(`${b.url}?v=${Date.now()}`, { cache: "no-store" });
        out[key] = await r.json();
      } catch { /* skip unreadable blob */ }
    }));
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
    await put(`${prefix}${who}.json`, JSON.stringify(bundle), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "method not allowed" });
}
