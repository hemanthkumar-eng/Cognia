import { Platform } from "react-native";

// Where the backend lives.
//
// On a physical device the app cannot reach "localhost" — that points at the
// phone itself. During development set EXPO_PUBLIC_API_URL to your computer's
// LAN IP (e.g. http://192.168.1.5:3000) in a .env file at the project root,
// or edit the fallback below.
//
// Android emulator reaches the host machine at 10.0.2.2; iOS simulator can use
// localhost directly.
const fallback = Platform.select({
  android: "http://10.0.2.2:3000",
  default: "http://localhost:3000",
});

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? fallback;

// Real-time streaming voice (Phase 2). Off by default so the stable turn-based
// path stays the default until streaming is validated on a device + live key.
// Enable with EXPO_PUBLIC_STREAMING=1 in the project .env.
export const STREAMING_ENABLED = process.env.EXPO_PUBLIC_STREAMING === "1";

// WebSocket URL for the streaming bridge, derived from API_URL
// (http→ws, https→wss). e.g. http://10.0.2.2:3000 → ws://10.0.2.2:3000/api/stream
export const WS_URL = `${API_URL.replace(/^http/, "ws")}/api/stream`;
