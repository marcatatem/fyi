/**
 *  Marca Makes Music
 *  Landing page CAPI Gateway
 *
 *  Created by Marca Tatem <marca@me.com> on 2025-12-21.
 *  Copyright 2025 Marca Tatem. All rights reserved.
 */

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

  // Reject non-POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // get request body
    const body = await req.json();
    // get real IP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "0.0.0.0";
    // build Meta payload
    const payload = {
      data: [{
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.eventId, // deduplication key
        event_source_url: body.url,
        action_source: "website",
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: body.userAgent,
          fbp: body.fbp,
          fbc: body.fbc,
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
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("CAPI Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
