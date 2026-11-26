import { ContinueListeningSong, Song, TrendingSong } from "./song";

export interface Quote {
  quote_text: string;
  author: string | null;
  anime: string | null;
  quote_type: "normal" | "special";
}

export interface HeroBanner {
  id: number;
  title: string;
  subtitle: string | null;
  image_path: string;
  target_url: string | null;
}

export interface PublicHomeData {
  trending: TrendingSong[];
  thisSeason: Song[];
  quotes: Quote[];
  banners: HeroBanner[];
  latest: Song[];
}

export interface UserHomeData {
  continueListening: ContinueListeningSong[];
  recommended: Song[];
}