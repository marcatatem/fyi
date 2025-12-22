/**
 *  Marca Makes Music
 *  Landing page CAPI Gateway
 *
 *  Created by Marca Tatem <marca@me.com> on 2025-12-21.
 *  Copyright 2025 Marca Tatem. All rights reserved.
 */

import { paramCase } from "case";

type Env = "development" | "production";
interface Config {
  env: Env;
  pixelId: string;
  token: string;
}

if (!Deno.env.get("PIXEL_ID") || !Deno.env.get("ACCESS_TOKEN")) {
  throw new Error("Have you added ENV variables?");
}

const config: Config = {
  env: Deno.env.get("ENV") as Env ?? "development",
  pixelId: Deno.env.get("PIXEL_ID")!,
  token: Deno.env.get("ACCESS_TOKEN")!,
};

const kv = await Deno.openKv();

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": config.env === "development"
      ? "*"
      : "https://marca.fyi",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle Browser Pre-flight checks
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  if (url.pathname === "/stats" && req.method === "GET") {
    const auth = req.headers.get("Authorization");

    // Simple Basic Auth check
    // Expects "Basic " + base64(username:password)
    // Here we check for username: "admin" and password from ENV
    const expectedAuth = btoa(
      `admin:${Deno.env.get("STATS_PASSWORD") || "default_pass"}`,
    );

    if (auth !== `Basic ${expectedAuth}`) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Artist Stats"' },
      });
    }

    return new Response("<h1>Hello Stats!</h1>", {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (req.method === "POST") {
    try {
      // get request body
      const body = await req.json();
      const {
        eventId,
        eventName,
        trackName,
        storeName,
        campaign,
        fbp,
        fbc,
        userAgent,
        url: sourceUrl,
      } = body;

      // get real IP
      const forwardedFor = req.headers.get("x-forwarded-for");
      const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "0.0.0.0";
      // build Meta payload
      const payload = {
        data: [{
          event_name: eventName || "ViewContent",
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId, // deduplication key
          event_source_url: sourceUrl,
          action_source: "website",
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
            fbp: fbp,
            fbc: fbc,
          },
        }],
        ...(Deno.env.get("TEST_EVENT_CODE")
          ? { test_event_code: Deno.env.get("TEST_EVENT_CODE") }
          : {}),
      };
      // send payload
      const resp = await fetch(
        `https://graph.facebook.com/v19.0/${config.pixelId}/events?access_token=${config.token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await resp.json();
      if (data.events_received) {
        console.log(`OK Sent ${eventName} to Meta. Response:`, data);
        // update kv
        const country = req.headers.get("cf-ipcountry") || "Unknown";
        const songSlug = paramCase(trackName);
        const atomic = kv.atomic();
        atomic.sum(["stats", songSlug, "total"], 1n);
        atomic.sum(["stats", songSlug, "campaign", campaign || "default", "total"], 1n);
        atomic.sum([
          "stats",
          songSlug,
          "campaign",
          campaign || "default",
          "store",
          storeName,
        ], 1n);
        atomic.sum(["stats", songSlug, "geo", country], 1n);
        const result = await atomic.commit();
        console.log(`${result.ok ? "OK" : "ERR"} KV Update for ${songSlug}`);
      } else {
        console.error(`WARN Meta received request but returned:`, data);
      }
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("ERR", err);
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Reject other requests
  return new Response("Not Found", { status: 404, headers: corsHeaders });
});
