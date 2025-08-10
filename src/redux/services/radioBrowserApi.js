import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'https://de1.api.radio-browser.info/json';

export const radioBrowserApi = createApi({
    reducerPath: 'radioBrowserApi',
    baseQuery: fetchBaseQuery({ baseUrl }),
    endpoints: (builder) => ({
        searchStations: builder.query({
            query: ({ country = '', language = 'english', name = '', hidebroken = true }) => 
                `/stations/search?countrycode=${country}&language=${language}&name=${name}&limit=100&hidebroken=${hidebroken}&order=clickcount&reverse=true`,
        }),
        getCountries: builder.query({
            query: () => '/countries?order=name',
        }),
        getLanguages: builder.query({
            query: () => '/languages?order=name&hidebroken=true',
        }),
    }),
});

export const {
    useSearchStationsQuery,
    useGetCountriesQuery,
    useGetLanguagesQuery,
} = radioBrowserApi;