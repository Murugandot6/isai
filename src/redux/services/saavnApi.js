import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const saavnApi = createApi({
    reducerPath: "saavnApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://saavn.dev/api",
    }),
    endpoints: (builder) => ({
        searchSongs: builder.query({
            query: (query) => `/search/songs?query=${query}&limit=5000`, // Increased limit to 5000
        }),
        getSongDetailsById: builder.query({
            query: (id) => `/songs?id=${id}`,
        }),
        getLyrics: builder.query({
            query: (songId) => `/lyrics/${songId}`,
        }),
        getArtistDetails: builder.query({
            query: ({ id }) => `/artists?id=${id}`,
        }),
        searchArtists: builder.query({
            query: (query) => `/search/artists?query=${query}&limit=50`,
        }),
        getAlbumDetails: builder.query({ // New endpoint for album details
            query: ({ id }) => `/albums?id=${id}`,
        }),
        searchAlbums: builder.query({ // NEW: Endpoint to search for albums directly
            query: (query) => `/search/albums?query=${query}&limit=50`,
        }),
    })
})

export const {
    useSearchSongsQuery,
    useGetSongDetailsByIdQuery,
    useGetLyricsQuery,
    useGetArtistDetailsQuery,
    useSearchArtistsQuery,
    useGetAlbumDetailsQuery,
    useSearchAlbumsQuery, // Export the new hook
} = saavnApi