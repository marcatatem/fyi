/**
 *  Marca Makes Music
 *  Landing page CAPI Gateway
 *
 *  Created by Marca Tatem <marca@me.com> on 2025-12-21.
 *  Copyright 2025 Marca Tatem. All rights reserved.
 */

import { paramCase } from "case";
import { getDashboardData } from "./src/utils/analytics.ts";
import { renderDashboard } from "utils/bundlers.ts";
import { getShortRevision } from "utils/git.ts";

type Env = "development" | "production";
interface Config {
  env: Env;
  pixelId: string;
  token: string;
  tiktokPixelId?: string;
  tiktokToken?: string;
}

const environment = Deno.env.get("ENV") as Env ?? "development";

if (
  environment !== "development" &&
  (!Deno.env.get("PIXEL_ID") || !Deno.env.get("ACCESS_TOKEN"))
) {
  throw new Error("Have you added ENV variables?");
}

const config: Config = {
  env: environment,
  pixelId: Deno.env.get("PIXEL_ID")!,
  token: Deno.env.get("ACCESS_TOKEN")!,
  tiktokPixelId: Deno.env.get("TIKTOK_PIXEL_ID"),
  tiktokToken: Deno.env.get("TIKTOK_ACCESS_TOKEN"),
};

const kv = await Deno.openKv();

const removeEmptyValues = (value: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(value).filter(([_, v]) => v !== undefined && v !== null),
  );
};

const getClientIp = (req: Request) => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor ? forwardedFor.split(",")[0].trim() : undefined;
};

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
    if (config.env === "production") {
      const auth = req.headers.get("Authorization");
      const expectedAuth = btoa(
        `admin:${Deno.env.get("STATS_PASSWORD") || "default_pass"}`,
      );
      if (auth !== `Basic ${expectedAuth}`) {
        return new Response("Unauthorized", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="Artist Stats"' },
        });
      }
    }
    const data = await getDashboardData(kv);
    const html = renderDashboard({
      revision: getShortRevision(),
      data: data,
      env: config.env === "production" ? "production" : "development",
    });
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (url.pathname === "/google" && req.method === "POST") {
    if (config.env !== "production") {
      return new Response("Google event capture is production-only", {
        status: 503,
        headers: corsHeaders,
      });
    }

    try {
      const body = await req.json();
      const {
        eventId,
        eventName,
        trackName,
        storeName,
        storeId,
        campaign,
        google,
        landingUrl,
        userAgent,
        url: sourceUrl,
      } = body;

      if (!eventId || !trackName || !storeName) {
        return new Response(
          JSON.stringify({ error: "Missing required event fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const clientIp = getClientIp(req);
      const country = req.headers.get("cf-ipcountry") || "Unknown";
      const songSlug = paramCase(trackName);
      const createdAt = new Date().toISOString();
      const event = removeEmptyValues({
        provider: "google",
        eventId,
        eventName: eventName || "ViewContent",
        trackName,
        songSlug,
        storeName,
        storeId,
        campaign: campaign || "default",
        sourceUrl,
        landingUrl,
        userAgent,
        clientIp,
        country,
        google,
        createdAt,
      });

      const atomic = kv.atomic();
      atomic.set(["events", "google", eventId], event);
      atomic.sum(["google_stats", songSlug, "total"], 1n);
      atomic.sum([
        "google_stats",
        songSlug,
        "campaign",
        campaign || "default",
        "total",
      ], 1n);
      atomic.sum([
        "google_stats",
        songSlug,
        "campaign",
        campaign || "default",
        "store",
        storeName,
      ], 1n);
      atomic.sum(["google_stats", songSlug, "geo", country], 1n);

      const result = await atomic.commit();
      console.log(`${result.ok ? "OK" : "ERR"} Google capture for ${songSlug}`);

      return new Response(JSON.stringify({ ok: result.ok }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("ERR Google capture", err);
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  if (url.pathname === "/tiktok" && req.method === "POST") {
    if (config.env !== "production") {
      return new Response("TikTok event capture is production-only", {
        status: 503,
        headers: corsHeaders,
      });
    }

    if (!config.tiktokPixelId || !config.tiktokToken) {
      return new Response(
        JSON.stringify({ error: "Missing TikTok Events API env variables" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    try {
      const body = await req.json();
      const {
        eventId,
        eventName,
        trackId,
        trackName,
        storeName,
        storeId,
        campaign,
        ttclid,
        ttp,
        referrer,
        userAgent,
        url: sourceUrl,
      } = body;

      if (!eventId || !trackName || !storeName) {
        return new Response(
          JSON.stringify({ error: "Missing required event fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const clientIp = getClientIp(req);
      const country = req.headers.get("cf-ipcountry") || "Unknown";
      const songSlug = paramCase(trackName);
      const contentId = trackId || songSlug;
      const event = eventName || "ViewContent";
      const payload = {
        event_source: "web",
        event_source_id: config.tiktokPixelId,
        data: [{
          event: event,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          user: removeEmptyValues({
            ip: clientIp,
            user_agent: userAgent,
            ttclid: ttclid,
            ttp: ttp,
          }),
          page: removeEmptyValues({
            url: sourceUrl,
            referrer: referrer,
          }),
          properties: removeEmptyValues({
            content_type: "product",
            content_name: trackName,
            contents: [{
              content_id: contentId,
              content_type: "product",
              content_name: trackName,
            }],
            service: storeName,
            store_id: storeId,
          }),
        }],
        ...(Deno.env.get("TIKTOK_TEST_EVENT_CODE")
          ? { test_event_code: Deno.env.get("TIKTOK_TEST_EVENT_CODE") }
          : {}),
      };

      const resp = await fetch(
        "https://business-api.tiktok.com/open_api/v1.3/event/track/",
        {
          method: "POST",
          headers: {
            "Access-Token": config.tiktokToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await resp.json();

      if (resp.ok && data.code === 0) {
        console.log(`OK Sent ${event} to TikTok. Response:`, data);
        const atomic = kv.atomic();
        atomic.set(
          ["events", "tiktok", eventId],
          removeEmptyValues({
            provider: "tiktok",
            eventId,
            eventName: event,
            trackName,
            songSlug,
            storeName,
            storeId,
            campaign: campaign || "default",
            sourceUrl,
            referrer,
            userAgent,
            clientIp,
            country,
            ttclid,
            ttp,
            createdAt: new Date().toISOString(),
          }),
        );
        atomic.sum(["tiktok_stats", songSlug, "total"], 1n);
        atomic.sum([
          "tiktok_stats",
          songSlug,
          "campaign",
          campaign || "default",
          "total",
        ], 1n);
        atomic.sum([
          "tiktok_stats",
          songSlug,
          "campaign",
          campaign || "default",
          "store",
          storeName,
        ], 1n);
        atomic.sum(["tiktok_stats", songSlug, "geo", country], 1n);
        const result = await atomic.commit();
        console.log(`${result.ok ? "OK" : "ERR"} TikTok KV Update for ${songSlug}`);
      } else {
        console.error(`WARN TikTok received request but returned:`, data);
      }

      return new Response(JSON.stringify(data), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("ERR TikTok capture", err);
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "POST") {
    if (config.env === "development") {
      return new Response("Not Authorized in development mode", {
        status: 503,
        headers: corsHeaders,
      });
    }
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
      const clientIp = getClientIp(req) || "0.0.0.0";
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
