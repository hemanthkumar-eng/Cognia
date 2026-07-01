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
