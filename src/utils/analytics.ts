import { paramCase } from "case";
import { Release } from "main.ts";

// Helper to read your static music data
async function getReleases(): Promise<Release[]> {
  try {
    const text = await Deno.readTextFile("./src/data/music.json");
    return JSON.parse(text);
  } catch {
    return []; // Fallback if file read fails
  }
}

interface Campaign {
  total: number;
  stores: Record<string, number>;
}

export interface Slug {
  meta: Release;
  total: number;
  campaigns: Record<string, Campaign>;
  geo: Record<string, number>;
}

export async function getDashboardData(kv: Deno.Kv) {
  const releases = await getReleases();
  const stats: Record<string, Slug> = {};

  // Initialize stats object with release metadata (for proper ordering)
  releases.forEach((rel: Release) => {
    // Assuming 'title' is the unique identifier logic you used for slugs
    const slug = paramCase(rel.title);
    stats[slug] = {
      meta: rel, // Keep cover, title, etc.
      total: 0,
      campaigns: {},
      geo: {},
    };
  });

  const entries = kv.list<bigint>({ prefix: ["stats"] });

  for await (const entry of entries) {
    const keyParts = entry.key as string[]; // ["stats", "mouth-of-madness", "total", ...]
    const [_, songSlug, category, ...rest] = keyParts;

    // Safely convert BigInt to Number
    const value = Number(entry.value);

    // Dynamic Fallback: If KV has data for a song not in music.json
    if (!stats[songSlug]) {
      stats[songSlug] = {
        meta: { title: songSlug } as Release, // Partial fallback
        total: 0,
        campaigns: {},
        geo: {},
      };
    }

    // 3. Hydrate the Slug object
    if (category === "total") {
      stats[songSlug].total = value;
    } else if (category === "campaign") {
      const [campaignName, type, store] = rest;

      // Initialize campaign if missing
      if (!stats[songSlug].campaigns[campaignName]) {
        stats[songSlug].campaigns[campaignName] = { total: 0, stores: {} };
      }

      if (type === "total") {
        stats[songSlug].campaigns[campaignName].total = value;
      } else if (type === "store" && store) {
        stats[songSlug].campaigns[campaignName].stores[store] = value;
      }
    } else if (category === "geo") {
      const [country] = rest;
      if (country) {
        stats[songSlug].geo[country] = value;
      }
    }
  }

  return stats;
}
