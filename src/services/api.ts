// API service for music-related requests

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  image: string;
  artists?: { primary?: Array<{ name: string }> };
  duration?: number;
  url?: string;
}

export interface SearchResponse {
  data: {
    results: SearchResult[];
  };
}

export const searchSongs = async (query: string): Promise<SearchResult[]> => {
  try {
    const res = await fetch(
      `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data: SearchResponse = await res.json();
    return data.data?.results || [];
  } catch (error) {
    console.error('Search songs error:', error);
    return [];
  }
};

export const searchArtists = async (query: string) => {
  try {
    const res = await fetch(
      `https://saavn.sumit.co/api/search/artists?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    return data.data?.results || [];
  } catch (error) {
    console.error('Search artists error:', error);
    return [];
  }
};

export const searchAlbums = async (query: string) => {
  try {
    const res = await fetch(
      `https://saavn.sumit.co/api/search/albums?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    return data.data?.results || [];
  } catch (error) {
    console.error('Search albums error:', error);
    return [];
  }
};

// Helper function to get artist names from API result
export const getArtistName = (song: SearchResult): string => {
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
