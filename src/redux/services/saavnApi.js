import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const saavnApi = createApi({
    reducerPath: "saavnApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://jiosaavn-api-privatecvc2.vercel.app", // Base URL from saavn-search.js
    }),
    endpoints: (builder) => ({
        searchSongs: builder.query({
            query: (query) => `/search/songs?query=${query}&limit=50`, // Generic search for songs
        }),
        getSongDetailsById: builder.query({
            query: (id) => `/songs?id=${id}`, // Assuming an endpoint to get song by ID
        }),
        getLyricsBySongId: builder.query({
            query: (id) => `/lyrics?id=${id}`,
        }),
        getArtistDetails: builder.query({ // New endpoint for artist details
            query: ({ id, link, page = 1, songCount = 10, albumCount = 10, sortBy = 'popularity', sortOrder = 'desc' }) => {
                let queryString = '';
                if (id) {
                    queryString = `id=${id}`;
                } else if (link) {
                    queryString = `link=${encodeURIComponent(link)}`;
                } else {
                    throw new Error('Either artist ID or link must be provided.');
                }
                
                queryString += `&page=${page}&songCount=${songCount}&albumCount=${albumCount}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
                return `/artists?${queryString}`;
            },
        }),
        getArtistAlbums: builder.query({ // NEW: Endpoint to fetch artist's albums
            query: ({ id, page = 1, sortBy = 'popularity', sortOrder = 'desc' }) => 
                `/artists/${id}/albums?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        }),
        searchArtists: builder.query({ // NEW: Endpoint to search artists
            query: (query) => `/search/artists?query=${query}&limit=50`,
        }),
    })
})

export const {
    useSearchSongsQuery,
    useGetSongDetailsByIdQuery,
    useGetLyricsBySongIdQuery,
    useGetArtistDetailsQuery,
    useGetArtistAlbumsQuery,
    useSearchArtistsQuery, // Export the new hook
} = saavnApi