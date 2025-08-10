import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'https://de1.api.radio-browser.info/json';

export const radioBrowserApi = createApi({
    reducerPath: 'radioBrowserApi',
    baseQuery: fetchBaseQuery({ baseUrl }),
    endpoints: (builder) => ({
        searchStations: builder.query({
            query: ({ country = '', language = 'english', name = '', hidebroken = true }) => {
                const params = new URLSearchParams({
                    language,
                    name,
                    limit: '500',
                    hidebroken,
                    order: 'clickcount',
                    reverse: 'true'
                });

                if (country) {
                    params.append('countrycode', country);
                }

                return `/stations/search?${params.toString()}`;
            },
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