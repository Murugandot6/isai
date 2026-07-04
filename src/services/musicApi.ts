export interface Song {
  id: string;
  name: string;
  primaryArtists: string;
  image: any;
  downloadUrl?: any[];
  language: string;
  album?: { id: string; name: string; url: string };
  year: string;
  duration: number;
  type?: string;
}

export interface Album {
  id: string;
  name: string;
  year: string;
  image: any;
  songs: Song[];
  songCount?: string;
  language?: string;
}

export interface Playlist {
  id: string;
  name: string;
  image: any;
  songs: Song[];
  language?: string;
  year?: string;
}

export const getContainerCount = (album: Album): number => {
  return album.songs?.length || Number(album.songCount) || 0;
};

export const musicApi = {
  getTrending: async (language: string = 'english', limit: number = 50): Promise<Song[]> => {
    const res = await fetch(`https://de1.api.radio-browser.info/json/stations/bylanguage/${encodeURIComponent(language)}?limit=${limit}`);
    const data = await res.json();
    return data as Song[];
  },
  searchSongs: async (query: string, page: number = 1, limit: number = 50): Promise<Song[]> => {
    const res = await fetch(`https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(query)}?limit=${limit}`);
    const data = await res.json();
    return data as Song[];
  },
  searchPlaylists: async (query: string, page: number = 1, limit: number = 50): Promise<Playlist[]> => {
    return [];
  },
  getAlbumDetails: async (id: string): Promise<Album> => {
    return { id, name: 'Album', year: '2024', image: null, songs: [] };
  },
  getPlaylistDetails: async (id: string): Promise<Playlist> => {
    return { id, name: 'Playlist', image: null, songs: [] };
  },
};