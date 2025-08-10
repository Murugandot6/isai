import { store } from "../redux/store";

const ACCEPTABLE_DATA_TYPES = ['tracks', 'artists', 'albums', 'genres', 'radios'];
const getStoreLibrary = () => store.getState().library;

var blacklist, favorites, ignoreFilter, dataType, filterRgxp, sortValue;

export const getData = ({ type, data, noFilter = false, albumFilter = '', sortType = '' }) => {
    if (!ACCEPTABLE_DATA_TYPES.includes(type) || !data) return data;
    
    const library = getStoreLibrary();

    blacklist = library.blacklist;
    favorites = library.favorites;
    ignoreFilter = noFilter;
    dataType = type;
    sortValue = sortType

    if (albumFilter) filterRgxp = new RegExp(albumFilter, 'i');
    else filterRgxp = new RegExp('', 'i');

    const newData = data
        .slice()
        .sort(handleSorting)
        .map(addFavoriteAndBlacklist)
        .filter(handleFilter);
    return newData;
}

export const getSingleData = ({ type, data }) => {
    if (!ACCEPTABLE_DATA_TYPES.includes(type) || !data) return data;

    const library = store.getState().library; // Get fresh library state
    
    blacklist = library.blacklist;
    favorites = library.favorites;
    dataType = type;

    const newItem = { ...data };

    // Add favorite and blacklist flags
    newItem.favorite = favorites[dataType]?.map(elem => elem.id).includes(data.id);
    newItem.blacklist = blacklist[dataType]?.map(elem => elem.id).includes(data.id);

    // Saavn specific data mapping
    if (type === 'tracks') {
        newItem.title = data.name;
        newItem.artist = { name: data.primaryArtists, id: data.artistMap?.artists?.[0]?.id || data.primaryArtists }; // Assuming primaryArtists is a string
        newItem.album = { title: data.album?.name, id: data.album?.id, cover_small: data.image?.[0]?.link, cover_medium: data.image?.[1]?.link, cover_big: data.image?.[2]?.link, cover_xl: data.image?.[2]?.link };
        newItem.duration = data.duration;
        newItem.explicit_lyrics = data.explicitContent === 1;
        newItem.preview = data.downloadUrl?.[0]?.link; // Use the first download URL as preview
        newItem.downloadUrl = data.downloadUrl; // Keep all download URLs
        newItem.image = data.image; // Keep all image sizes
    } else if (type === 'albums') {
        newItem.title = data.name;
        newItem.artist = { name: data.primaryArtists, id: data.artistMap?.artists?.[0]?.id || data.primaryArtists };
        newItem.cover_medium = data.image?.[1]?.link;
        newItem.cover_xl = data.image?.[2]?.link;
        newItem.release_date = data.year; // Saavn provides year, not full date
    } else if (type === 'artists') {
        newItem.name = data.name;
        newItem.picture_medium = data.image?.[1]?.link;
        newItem.picture_xl = data.image?.[2]?.link;
    } else if (type === 'genres') {
        newItem.name = data.name;
        newItem.picture_medium = data.image?.[1]?.link;
        newItem.picture_xl = data.image?.[2]?.link;
    } else if (type === 'radios') {
        newItem.title = data.name;
        newItem.picture_medium = data.image?.[1]?.link;
        newItem.picture_xl = data.image?.[2]?.link;
    }

    // For tracks, if there are nested tracks (e.g., album details), process them
    if (data.tracks) {
        newItem.tracks = getData({ type: 'tracks', data: data.tracks.data });
    }

    return newItem;
}

function handleSorting(a, b) {
    let sortNumber = 0; // Default to no change

    if (sortValue === 'popular') {
        // Saavn API doesn't provide 'rank' or 'release_date' consistently for all types for sorting.
        // For simplicity, we'll sort by duration for songs, and name for others.
        if (dataType === 'tracks') {
            sortNumber = b.duration - a.duration; // Sort by duration (longer first)
        } else {
            sortNumber = a.name?.localeCompare(b.name); // Sort alphabetically by name
        }
    } else if (sortValue === 'recent') {
        // Saavn API provides 'year' for songs/albums, not full release_date for all.
        // We'll sort by year if available, otherwise by name.
        if (a.year && b.year) {
            sortNumber = b.year - a.year; // Sort by year (newer first)
        } else {
            sortNumber = a.name?.localeCompare(b.name); // Fallback to alphabetical
        }
    }

    return sortNumber;
};

function handleFilter(item) {
    const itemInBlacklist = !item.blacklist || ignoreFilter;
    // Saavn API doesn't consistently provide 'record_type' for filtering.
    // This filter might not be fully functional with Saavn data.
    const itemIsAlbumWithRecType = dataType === 'albums' ? filterRgxp.test(item.record_type || '') : true;
    return itemInBlacklist && itemIsAlbumWithRecType;
};

function addFavoriteAndBlacklist(item) {
    // If it's a track, use getSingleData to ensure proper mapping (name -> title)
    // getSingleData already handles favorite/blacklist, so we just need to pass the raw item
    // and it will return the normalized item with favorite/blacklist flags.
    if (dataType === 'tracks') {
        return getSingleData({ type: 'tracks', data: item });
    }

    // For other types, just add favorite/blacklist flags as before
    const newItem = { ...item };
    newItem.favorite = favorites[dataType]?.map(elem => elem.id).includes(item.id);
    newItem.blacklist = blacklist[dataType]?.map(elem => elem.id).includes(item.id);
    return newItem;
};