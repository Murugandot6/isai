import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playlistId } = await req.json();

    if (!playlistId) {
      return new Response(JSON.stringify({ error: 'Playlist ID is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get Spotify API credentials from environment variables
    const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
    const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: 'Spotify API credentials not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 1. Get Spotify Access Token (Client Credentials Flow)
    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      console.error('Spotify Auth Error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to get Spotify access token', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: authResponse.status,
      });
    }

    const { access_token } = await authResponse.json();

    // 2. Fetch Playlist Tracks
    const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=US`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!playlistResponse.ok) {
      const errorData = await playlistResponse.json();
      console.error('Spotify Playlist Fetch Error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to fetch Spotify playlist', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: playlistResponse.status,
      });
    }

    const playlistData = await playlistResponse.json();

    // Map Spotify track data to your existing song structure
    const mappedTracks = playlistData.items.map(item => {
      const track = item.track;
      if (!track) return null; // Skip if track data is missing

      // Find a suitable image URL (Spotify provides multiple sizes)
      const imageUrl = track.album?.images?.[2]?.url || track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || 'https://picsum.photos/200/200';

      // Find a suitable download URL (Spotify API doesn't provide direct download links,
      // so we'll use a placeholder or a generic sample if available, or leave empty)
      // For demonstration, I'll use a generic sample MP3. In a real app, you'd need a
      // different source for playable audio.
      const downloadUrl = [{ quality: "160kbps", link: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }]; // Placeholder

      return {
        id: track.id,
        name: track.name,
        title: track.name, // Map to title for consistency with existing components
        primaryArtists: track.artists.map(artist => artist.name).join(', '),
        artist: {
          id: track.artists[0]?.id,
          name: track.artists[0]?.name,
        },
        album: {
          id: track.album?.id,
          name: track.album?.name,
          image: track.album?.images.map(img => ({ link: img.url })),
        },
        duration: track.duration_ms ? Math.floor(track.duration_ms / 1000) : 0, // Convert ms to seconds
        explicitContent: track.explicit ? 1 : 0, // 1 for explicit, 0 for not
        downloadUrl: downloadUrl,
        image: track.album?.images.map(img => ({ link: img.url })),
        preview_url: track.preview_url, // Spotify's 30-second preview
      };
    }).filter(Boolean); // Remove any null entries

    return new Response(JSON.stringify({ tracks: mappedTracks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});