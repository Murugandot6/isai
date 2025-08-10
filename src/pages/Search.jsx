import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { Songs, Artists, Albums } from "../components/List"; // Import Artists and Albums
import { useEffect, useMemo } from "react";
import { useSearchSongsQuery, useSearchArtistsQuery, useGetAlbumDetailsQuery } from "../redux/services/saavnApi"; // Import new hooks
import { getData } from "../utils/fetchData";

const categories = ['All', 'Song', 'Artist', 'Album']; // Added Artist and Album categories

const Search = () => {
    const { searchTerm } = useParams()
    const [params, setParams] = useSearchParams()
    const library = useSelector(state => state.library)

    // Fetch songs
    const { data: searchSongsResults, isFetching: isFetchingSongs, error: errorSongs } = useSearchSongsQuery(searchTerm);
    const filteredSongs = useMemo(() => {
        const rawResults = searchSongsResults?.data?.results || [];
        const categoryParam = params.get('cat');
        const preFiltered = rawResults.filter(item => {
            if (categoryParam === 'Song' && item.type !== 'song') return false;
            return true;
        });
        return getData({ type: 'tracks', data: preFiltered, library });
    }, [searchSongsResults, params, library]);

    // Fetch artists
    const { data: searchArtistsResults, isFetching: isFetchingArtists, error: errorArtists } = useSearchArtistsQuery(searchTerm);
    const filteredArtists = useMemo(() => {
        const rawResults = searchArtistsResults?.data?.results || [];
        return getData({ type: 'artists', data: rawResults, library });
    }, [searchArtistsResults, library]);

    // Fetch albums (Saavn API doesn't have a direct /search/albums, so we'll use searchSongs and filter, or searchArtists and get their albums if needed)
    // For simplicity, we'll just filter from song search results for now, or rely on artist details for albums.
    // A more robust solution might involve a dedicated album search if the API supported it.
    const { data: searchAlbumsResults, isFetching: isFetchingAlbums, error: errorAlbums } = useSearchSongsQuery(searchTerm, {
        selectFromResult: ({ data, isFetching, error }) => ({
            data: data?.data?.results?.filter(item => item.type === 'album') || [],
            isFetching,
            error,
        }),
    });
    const filteredAlbums = useMemo(() => {
        const rawResults = searchAlbumsResults || [];
        return getData({ type: 'albums', data: rawResults, library });
    }, [searchAlbumsResults, library]);


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
                <Albums albums={filteredAlbums} isFetching={isFetchingAlbums} error={errorAlbums}>
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