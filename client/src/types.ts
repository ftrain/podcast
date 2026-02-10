export interface Guest {
  id: string;
  name: string;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { appearances: number };
  appearances?: EpisodeGuest[];
}

export type EpisodeStatus =
  | "IDEA"
  | "PLANNED"
  | "RECORDING"
  | "EDITING"
  | "PUBLISHED";

export interface Episode {
  id: string;
  title: string;
  description: string | null;
  status: EpisodeStatus;
  episodeNum: number | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  guests?: EpisodeGuest[];
  assets?: Asset[];
  _count?: { assets: number };
}

export interface EpisodeGuest {
  id: string;
  episodeId: string;
  guestId: string;
  role: string;
  createdAt: string;
  episode?: Episode;
  guest?: Guest;
}

export type AssetCategory =
  | "AUDIO"
  | "COVER_ART"
  | "GUEST_PHOTO"
  | "EPISODE_ARTWORK"
  | "OTHER";

export interface Asset {
  id: string;
  filename: string;
  storedName: string;
  mimeType: string;
  size: number;
  category: AssetCategory;
  episodeId: string | null;
  description: string | null;
  createdAt: string;
  episode?: { id: string; title: string } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PipelineGroup {
  status: EpisodeStatus;
  episodes: Episode[];
  count: number;
}
