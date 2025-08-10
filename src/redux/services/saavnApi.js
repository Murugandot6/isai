import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const saavnApi = createApi({
    reducerPath: "saavnApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://saavn.dev/api",
    }),
    endpoints: (builder) => ({
        searchSongs: builder.query({
            query: (query) => `/search/songs?query=${query}&limit=50`,
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
    })
})

export const {
    useSearchSongsQuery,
    useGetSongDetailsByIdQuery,
    useGetLyricsQuery,
    useGetArtistDetailsQuery,
    useSearchArtistsQuery,
} = saavnApi