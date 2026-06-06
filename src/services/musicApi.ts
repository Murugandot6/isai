const BASE_URL = 'https://saavn.sumit.co/api';

export interface Song {
  id: string;
  name: string;
  type: string;
  album: {
    id: string;
    name: string;
    url: string;
  };
  year: string;
  releaseDate: string;
  duration: number;
  label: string;
  primaryArtists: string;
  featuredArtists: string;
  artists: {
    primary: { name: string; id: string; image: { link: string; quality: string }[] }[];
  };
  image: { link: string; quality: string }[];
  downloadUrl: { link: string; quality: string }[];
}

export const musicApi = {
  getTrending: async () => {
    const res = await fetch(`${BASE_URL}/search/songs?query=trending&limit=20`);
    const data = await res.json();
    return data.data.results as Song[];
  },
  searchSongs: async (query: string) => {
    const res = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=30`);
    const data = await res.json();
    return data.data.results as Song[];
  },
  getSongDetails: async (id: string) => {
    const res = await fetch(`${BASE_URL}/songs?id=${id}`);
    const data = await res.json();
    return data.data[0] as Song;
  }
};