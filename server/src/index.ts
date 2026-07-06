import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { converse } from "./routes/converse.js";
import { SCENARIOS } from "./scenarios.js";
import { setupStreaming } from "./stream.js";

const app = new Hono();

// The Expo app calls this from devices on the LAN, so allow cross-origin.
app.use("*", cors());

app.get("/api/health", (c) =>
  c.json({ ok: true, service: "cognia-server", time: new Date().toISOString() }),
);

// Lesson catalogue — the app renders these as cards.
app.get("/api/scenarios", (c) =>
  c.json(
    SCENARIOS.map(({ id, emoji, title, blurb, levels }) => ({
      id,
      emoji,
      title,
      blurb,
      levels,
    })),
  ),
);

app.route("/api/converse", converse);

const port = Number(process.env.PORT || 3000);
const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Cognia server listening on http://localhost:${info.port}`);
  if (!process.env.SARVAM_API_KEY) {
    console.warn(
      "⚠  SARVAM_API_KEY not set — /api/converse and /api/stream will error until you add it to server/.env",
    );
  }
});

// Attach the real-time voice WebSocket bridge to the same HTTP server.
setupStreaming(server as unknown as import("node:http").Server);
