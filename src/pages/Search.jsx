import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { Songs, Artists, Albums } from "../components/List";
import { useEffect, useMemo, useState } from "react";
import { useSearchSongsQuery, useSearchArtistsQuery, useGetAlbumDetailsQuery, useSearchAlbumsQuery } from "../redux/services/saavnApi";
import { getData } from "../utils/fetchData";
import { store } from '../redux/store';
import { saavnApi } from '../redux/services/saavnApi';

const categories = ['All', 'Song', 'Artist', 'Album'];

const Search = () => {
    const { searchTerm } = useParams()
    const [params, setParams] = useSearchParams()
    const library = useSelector(state => state.library)
    const { selectedLanguage } = useSelector(state => state.settings);

    // Fetch songs
    const { data: searchSongsResults, isFetching: isFetchingSongs, error: errorSongs } = useSearchSongsQuery(searchTerm);
    const filteredSongs = useMemo(() => {
        const rawResults = searchSongsResults?.data?.results || [];
        const categoryParam = params.get('cat');
        const preFiltered = rawResults.filter(item => {
            if (categoryParam === 'Song' && item.type !== 'song') return false;
            return true;
        });
        return getData({ type: 'tracks', data: preFiltered, library, selectedLanguage });
    }, [searchSongsResults, params, library, selectedLanguage]);

    // Fetch artists
    const { data: searchArtistsResults, isFetching: isFetchingArtists, error: errorArtists } = useSearchArtistsQuery(searchTerm);
    const filteredArtists = useMemo(() => {
        const rawResults = searchArtistsResults?.data?.results || [];
        return getData({ type: 'artists', data: rawResults, library, selectedLanguage });
    }, [searchArtistsResults, library, selectedLanguage]);

    // NEW: Fetch albums directly
    const { data: searchAlbumsResults, isFetching: isFetchingDirectAlbums, error: errorDirectAlbums } = useSearchAlbumsQuery(searchTerm);
    const directAlbums = useMemo(() => {
        const rawResults = searchAlbumsResults?.data?.results || [];
        return getData({ type: 'albums', data: rawResults, library, selectedLanguage });
    }, [searchAlbumsResults, library, selectedLanguage]);

    // State for albums fetched from artists
    const [albumsFromArtists, setAlbumsFromArtists] = useState([]);
    const [isFetchingAlbumsFromArtists, setIsFetchingAlbumsFromArtists] = useState(false);
    const [errorAlbumsFromArtists, setErrorAlbumsFromArtists] = useState(false);

    // Effect to fetch albums from top artists
    useEffect(() => {
        const fetchAlbums = async () => {
            if (searchArtistsResults?.data?.results?.length > 0) {
                setIsFetchingAlbumsFromArtists(true);
                setErrorAlbumsFromArtists(false);
                const topArtists = searchArtistsResults.data.results.slice(0, 5); // Limit to top 5 artists
                const albumPromises = topArtists.map(artist =>
                    store.dispatch(saavnApi.endpoints.getArtistDetails.initiate({ id: artist.id }))
                );

                try {
                    const artistDetailsResults = await Promise.all(albumPromises);
                    let collectedAlbums = [];
                    artistDetailsResults.forEach(result => {
                        if (result.data?.data?.topAlbums) {
                            collectedAlbums = collectedAlbums.concat(result.data.data.topAlbums);
                        }
                    });
                    // Filter out duplicates and normalize
                    const uniqueAlbums = Array.from(new Map(collectedAlbums.map(album => [album.id, album])).values());
                    setAlbumsFromArtists(getData({ type: 'albums', data: uniqueAlbums, library, selectedLanguage }));
                } catch (err) {
                    console.error("Error fetching albums from artists:", err);
                    setErrorAlbumsFromArtists(true);
                } finally {
                    setIsFetchingAlbumsFromArtists(false);
                }
            } else {
                setAlbumsFromArtists([]); // Clear if no artists found
                setIsFetchingAlbumsFromArtists(false);
            }
        };

        const categoryParam = params.get('cat');
        if ((categoryParam === 'All' || categoryParam === 'Album') && searchArtistsResults) {
            fetchAlbums();
        } else {
            setAlbumsFromArtists([]);
        }
    }, [searchTerm, searchArtistsResults, params, library, selectedLanguage]);

    // Combine albums from direct album search, then song search, then artists
    const combinedAlbums = useMemo(() => {
        const albumsFromSongs = searchSongsResults?.data?.results?.filter(item => item.type === 'album') || [];
        const normalizedAlbumsFromSongs = getData({ type: 'albums', data: albumsFromSongs, library, selectedLanguage });

        // Prioritize direct album search results
        const allAlbums = [...directAlbums, ...normalizedAlbumsFromSongs, ...albumsFromArtists];
        
        // Use a Map to remove duplicates by ID, preserving the order of the first occurrence
        const uniqueAlbumsMap = new Map();
        for (const album of allAlbums) {
            if (album && album.id) { // Ensure album and its ID exist
                uniqueAlbumsMap.set(album.id, album);
            }
        }
        return Array.from(uniqueAlbumsMap.values());
    }, [searchSongsResults, albumsFromArtists, directAlbums, library, selectedLanguage]);

    // Determine overall fetching/error state for albums
    const isFetchingAlbums = isFetchingDirectAlbums || isFetchingAlbumsFromArtists || isFetchingSongs;
    const errorAlbums = errorDirectAlbums || errorAlbumsFromArtists || errorSongs;

    useEffect(() => {
        const text = `Isai Search results for - ${searchTerm}`
        document.getElementById('site_title').innerText = text
    }, [searchTerm])

    const selectedCategory = params.get('cat') || 'All';

    return (
        <div className="flex flex-col px-2 md:px-4 gap-6">
            <ul className="flex flex-row items-center justify-center lg:justify-start overflow-x-auto overflow-y-clip gap-2 text-gray-300 font-bold">
                {
                    categories.map((category, i) => (
                        <li
                            key={i}
                            className={`rounded-[18px] flex items-center justify-center px-2 md:px-3 h-[28px] min-w-[60px] md:h-[32px] text-xs sm:text-sm hover:text-gray-100 border border-white/10 ${selectedCategory === category || (selectedCategory === 'All' && category === 'All') ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                            <button onClick={() => setParams({ 'cat': category })}>{category}</button>
                        </li>
                    ))
                }
            </ul>

            {(selectedCategory === 'All' || selectedCategory === 'Song') && (
                <Songs songs={filteredSongs} isFetching={isFetchingSongs} error={errorSongs} blacklist={library.blacklist} favorites={library.favorites}>
                    <span>
                        <span className="text-gray-400 text-sm md:text-base">Songs for </span>
                        <span className="text-gray-100 text-sm md:text-base">{searchTerm}</span>
                    </span>
                </Songs>
            )}

            {(selectedCategory === 'All' || selectedCategory === 'Artist') && (
                <Artists artists={filteredArtists} isFetching={isFetchingArtists} error={errorArtists}>
                    <span>
                        <span className="text-gray-400 text-sm md:text-base">Artists for </span>
                        <span className="text-gray-100 text-sm md:text-base">{searchTerm}</span>
                    </span>
                </Artists>
            )}

            {(selectedCategory === 'All' || selectedCategory === 'Album') && (
                <Albums albums={combinedAlbums} isFetching={isFetchingAlbums} error={errorAlbums}>
                    <span>
                        <span className="text-gray-400 text-sm md:text-base">Albums for </span>
                        <span className="text-gray-100 text-sm md:text-base">{searchTerm}</span>
                    </span>
                </Albums>
            )}
        </div>
    )
};

export default Search;