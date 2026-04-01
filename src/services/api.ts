// API service for music-related requests

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  image: string;
  artists?: { primary?: Array<{ name: string }> };
  primaryArtists?: string;
  duration?: number;
  url?: string;
  downloadUrl?: Array<{ quality: string; url: string }>;
  songCount?: string;
  year?: string;
}

export interface SearchResponse {
  data: {
    results: SearchResult[];
  };
}

const FALLBACK_IMAGE = 'https://via.placeholder.com/300x300.png?text=Music';

const getImageUrl = (image: unknown): string => {
  if (!image) return FALLBACK_IMAGE;

  if (typeof image === 'string') {
    return image;
  }

  if (Array.isArray(image)) {
    const sortedImages = [...image].sort((a: any, b: any) => {
      const aq = Number(a?.quality?.replace(/\D/g, '')) || 0;
      const bq = Number(b?.quality?.replace(/\D/g, '')) || 0;
      return bq - aq;
    });
    return sortedImages[0]?.url || FALLBACK_IMAGE;
  }

  if (typeof image === 'object' && image !== null && 'url' in image) {
    return String((image as { url?: string }).url || FALLBACK_IMAGE);
  }

  return FALLBACK_IMAGE;
};

const getPlayableUrl = (result: any): string | undefined => {
  if (Array.isArray(result?.downloadUrl) && result.downloadUrl.length > 0) {
    const sorted = [...result.downloadUrl].sort((a: any, b: any) => {
      const aq = Number(a?.quality?.replace(/\D/g, '')) || 0;
      const bq = Number(b?.quality?.replace(/\D/g, '')) || 0;
      return bq - aq;
    });
    return sorted[0]?.url;
  }

  if (typeof result?.url === 'string' && result.url.length > 0) {
    // Fallback only when endpoint already returns a direct audio URL.
    if (!result.url.includes('jiosaavn.com/song/')) {
      return result.url;
    }
  }

  return undefined;
};

const normalizeResult = (item: any): SearchResult => ({
  id: String(item?.id || ''),
  title: String(item?.title || item?.name || 'Unknown'),
  description: item?.description ? String(item.description) : undefined,
  image: getImageUrl(item?.image),
  artists: item?.artists,
  primaryArtists: typeof item?.primaryArtists === 'string' ? item.primaryArtists : undefined,
  duration: typeof item?.duration === 'number' ? item.duration : undefined,
  url: getPlayableUrl(item),
  downloadUrl: Array.isArray(item?.downloadUrl) ? item.downloadUrl : undefined,
  songCount: item?.songCount ? String(item.songCount) : undefined,
  year: item?.year ? String(item.year) : undefined,
});

export const searchSongs = async (query: string): Promise<SearchResult[]> => {
  try {
    const res = await fetch(
      `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data: SearchResponse = await res.json();
    return (data.data?.results || []).map(normalizeResult);
  } catch (error) {
    console.error('Search songs error:', error);
    return [];
  }
};

export const searchSongsByQueries = async (
  queries: string[],
  limit = 20,
): Promise<SearchResult[]> => {
  try {
    const results = await Promise.all(
      queries
        .map((query) => query.trim())
        .filter((query) => query.length > 0)
        .map((query) => searchSongs(query)),
    );

    const merged = results
      .flat()
      .filter((song) => Boolean(song.id && song.url && song.title));

    const uniqueSongs = merged.filter(
      (song, index, arr) => arr.findIndex((item) => item.id === song.id) === index,
    );

    return uniqueSongs.slice(0, limit);
  } catch (error) {
    console.error('Search songs by queries error:', error);
    return [];
  }
};

export const searchArtists = async (query: string): Promise<SearchResult[]> => {
  try {
    const res = await fetch(
      `https://saavn.sumit.co/api/search/artists?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    return (data.data?.results || []).map(normalizeResult);
  } catch (error) {
    console.error('Search artists error:', error);
    return [];
  }
};

export const searchAlbums = async (query: string): Promise<SearchResult[]> => {
  try {
    const res = await fetch(
      `https://saavn.sumit.co/api/search/albums?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    return (data.data?.results || []).map(normalizeResult);
  } catch (error) {
    console.error('Search albums error:', error);
    return [];
  }
};

// Helper function to get artist names from API result
export const getArtistName = (song: SearchResult): string => {
  if (song.primaryArtists) {
    return song.primaryArtists;
  }

  if (song.artists?.primary?.[0]?.name) {
    return song.artists.primary[0].name;
  }
  return 'Unknown Artist';
};

// Helper to format duration from seconds to MM:SS
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
