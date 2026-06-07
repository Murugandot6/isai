"use client";

export interface StremioStream {
  name: string;
  title: string;
  url?: string;
  infoHash?: string;
  fileIdx?: number;
  behaviorHints?: {
    bingeGroup?: string;
    notWebReady?: boolean;
    [key: string]: any;
  };
}

const CORS_PROXY = "https://corsproxy.io/?";

const ADDONS = {
  torrentio: "https://torrentio.strem.fun/stream",
  mediafusion: "https://mediafusion.fun/stream",
  comet: "https://comet.elfhosted.com/stream"
};

export const stremioApi = {
  getStreams: async (imdbId: string, type: "movie" | "series" = "movie"): Promise<StremioStream[]> => {
    const streams: StremioStream[] = [];
    
    const fetchFromAddon = async (addonUrl: string, providerName: string) => {
      try {
        const targetUrl = `${addonUrl}/${type}/${imdbId}.json`;
        const res = await fetch(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && Array.isArray(data.streams)) {
          data.streams.forEach((stream: any) => {
            streams.push({
              name: `[${providerName}] ${stream.name || 'Stream'}`,
              title: stream.title || 'No description available',
              url: stream.url,
              infoHash: stream.infoHash,
              fileIdx: stream.fileIdx,
              behaviorHints: stream.behaviorHints
            });
          });
        }
      } catch (error) {
        console.error(`Failed to fetch streams from ${providerName}:`, error);
      }
    };

    // Fetch from all addons concurrently
    await Promise.all([
      fetchFromAddon(ADDONS.torrentio, "Torrentio"),
      fetchFromAddon(ADDONS.mediafusion, "MediaFusion"),
      fetchFromAddon(ADDONS.comet, "Comet")
    ]);

    return streams;
  }
};