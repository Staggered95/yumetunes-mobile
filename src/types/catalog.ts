import { Song } from "./song";

export interface AnimeListItem {
  id: number;
  title: string;
  track_count: number;
  collage_covers: string[];
}

export interface ArtistListItem {
  id: number;
  name: string;
  track_count: number;
  profile_pic: string | null;
}

export interface FeaturedAnime {
  id: number;
  title: string;
  anime_cover: string | null;
}

export interface ArtistDetailsData {
  featuredAnimes: FeaturedAnime[];
}

export interface GenreItem {
  genre: string;
  track_count: number;
}

export interface SearchEntity {
  id: number;
  name: string;
  image: string | null;
}

export interface GlobalSearchData {
  songs: Song[];
  artists: SearchEntity[];
  animes: SearchEntity[];
}

export interface SearchQueryParams {
  q?: string;
  genre?: string;
  type?: string;
  page?: number;
  limit?: number;
}