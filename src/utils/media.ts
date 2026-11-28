import { AUDIO_BASE_URL, IMAGE_BASE_URL } from "./constants";

export type MediaType = "image" | "audio";

const encodePathSegments = (path: string): string =>
  path
    .split("/")
    .map((segment) => {
      if (!segment) return "";
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");

export const getMediaUrl = (
  path: string | null | undefined,
  type: MediaType = "image",
  width = 800
): string | undefined => {
  if (!path) return undefined;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    // Smart Cloudinary optimizer
    if (type === "image" && path.includes("cloudinary.com")) {
      if (
        path.endsWith(".webp") ||
        path.includes("/upload/f_auto") ||
        path.includes("/upload/q_auto")
      ) {
        return path;
      }
      return path.replace(
        "/upload/",
        `/upload/f_auto,q_auto,w_${width},c_limit/`
      );
    }

    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const encodedPath = encodePathSegments(cleanPath);
  const baseUrl = type === "audio" ? AUDIO_BASE_URL : IMAGE_BASE_URL;

  return `${baseUrl}${encodedPath}`;
};

export const formatDuration = (seconds?: number | null): string => {
  if (!seconds || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};