export const SITE_BASE_URL =
  process.env.EXPO_PUBLIC_SITE_URL ?? "https://yumetunes.duckdns.org";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `${SITE_BASE_URL}/api`;

export const AUDIO_BASE_URL =
  process.env.EXPO_PUBLIC_AUDIO_BASE_URL ?? SITE_BASE_URL;

export const IMAGE_BASE_URL =
  process.env.EXPO_PUBLIC_IMAGE_BASE_URL ?? SITE_BASE_URL;

export const GENRES = [
  "Soft",
  "Rock",
  "Vibe",
  "Normal",
  "Quite Different",
] as const;

export const TYPES = ["OP", "ED", "OST"] as const;

export type GenreOption = (typeof GENRES)[number];
export type SongTypeOption = (typeof TYPES)[number];