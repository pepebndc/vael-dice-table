// Sync store: Upstash Redis (free tier) via its REST API, reached with plain
// fetch — no SDK. Connect the Upstash integration in the Vercel dashboard and
// the env vars below appear; each poll costs one MGET, each save one SET.

// Per-player bundles plus shared bundles the Warden (?master) edits:
// "npcs" (the bestiary) and "music" (the Bard's Veil now-playing broadcast).
const CHARS = new Set(["paco", "ray", "odinson"]);
const SHARED = new Set(["npcs", "music"]);
// Every key this table can hold — a fixed set, so reads are a single MGET.
const KEYS = ["paco", "ray", "odinson", "npcs", "music"];

const REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

async function redis(cmd) {
  const r = await fetch(REST_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

export default async function handler(req, res) {
  const table = String(req.query.table || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40);
  if (!table) return res.status(400).json({ error: "table required" });
  const prefix = `tables/${table}/`;
  res.setHeader("Cache-Control", "no-store");

  if (!REST_URL || !REST_TOKEN) {
    return res.status(500).json({
      error: "storage not configured",
      hint: "connect the Upstash Redis integration to this Vercel project, then redeploy",
    });
  }

  try {
    if (req.method === "GET") {
      const vals = await redis(["MGET", ...KEYS.map((k) => prefix + k)]);
      const out = {};
      KEYS.forEach((key, i) => {
        if (vals && vals[i]) {
          try { out[key] = JSON.parse(vals[i]); } catch { /* corrupt value → skip */ }
        }
      });
      return res.status(200).json(out);
    }

    if (req.method === "PUT") {
      const { who, bundle } = req.body || {};
      if ((!CHARS.has(who) && !SHARED.has(who)) || !bundle || typeof bundle !== "object") {
        return res.status(400).json({ error: "bad payload" });
      }
      const body = JSON.stringify(bundle);
      if (body.length > 100000) {
        return res.status(413).json({ error: "too large" });
      }
      await redis(["SET", prefix + who, body]);
      return res.status(200).json({ ok: true });
    }
  } catch (e) {
    return res.status(500).json({ error: "storage failed", hint: String((e && e.message) || e) });
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "method not allowed" });
}
