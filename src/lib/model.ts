export interface Server {
  name: string;
  url: string;
}
export interface Episode {
  number: number;
  title: string;
  servers: Server[];
  video?: { uploadDate: string; description: string };
  downloads?: { name: string; url: string }[];
}
export interface Anime {
  id: string;
  slug: string;
  title: string;
  original: string;
  aliases: string[];
  description: string;
  poster: string;
  cover: string;
  genres: string[];
  year: number;
  season: string;
  status: string;
  studio: string;
  format: string;
  language: string;
  updated: string;
  featured: boolean;
  episodes: Episode[];
  nextRelease?: string;
}
export interface Rule {
  host: string;
  path: string;
}
