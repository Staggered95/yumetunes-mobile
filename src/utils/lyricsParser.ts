import { LyricLine } from "@/types";

const TIME_REGEX = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

export const parseLRC = (lrcString?: string | null): LyricLine[] => {
  if (!lrcString) return [];

  const lines = lrcString.split(/\r?\n/);
  const lyrics: LyricLine[] = [];

  for (const line of lines) {
    const match = line.match(TIME_REGEX);
    if (!match) continue;

    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const ms = parseInt(match[3], 10);
    const text = match[4].trim();

    const time =
      minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100);

    if (text) {
      lyrics.push({ time, text });
    }
  }

  return lyrics.sort((a, b) => a.time - b.time);
};