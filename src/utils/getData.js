import { store } from "../redux/store";

const ACCEPTABLE_DATA_TYPES = ['tracks', 'artists', 'albums', 'genres', 'radios'];
const getStoreLibrary = () => store.getState().library;

var blacklist, favorites, ignoreFilter, dataType, filterRgxp, sortValue, languageFilterValue; // Add languageFilterValue

export const getData = ({ type, data, noFilter = false, albumFilter = '', sortType = '', languageFilter = '' }) => { // Add languageFilter
    if (!ACCEPTABLE_DATA_TYPES.includes(type) || !data) return data;
    
    const library = getStoreLibrary();

    blacklist = library.blacklist;
    favorites = library.favorites;
    ignoreFilter = noFilter;
    dataType = type;
    sortValue = sortType
    languageFilterValue = languageFilter; // Set the new filter value

    if (albumFilter) filterRgxp = new RegExp(albumFilter, 'i');
    else filterRgxp = new RegExp('', 'i');

    const newData = data
        .slice()
        .sort(handleSorting)
        .map(addFavoriteAndBlacklist)
        .filter(handleFilter)
        .filter(handleLanguageFilter); // Add new filter step
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

    // Helper to get the highest quality image link
    const getHighestQualityImage = (imageArray) => {
        if (!imageArray || !Array.isArray(imageArray) || imageArray.length === 0) return '';
        // Prioritize 500x500, then 150x150, then 50x50
        return imageArray.find(img => img.quality === '500x500')?.link ||
               imageArray.find(img => img.quality === '150x150')?.link ||
               imageArray[0]?.link || '';
    };

    // Helper to get the highest quality download link for streaming
    const getHighestQualityStreamUrl = (downloadUrlArray) => {
        if (!downloadUrlArray || !Array.isArray(downloadUrlArray) || downloadUrlArray.length === 0) return '';
        // Prioritize 320kbps, then 160kbps, then 128kbps, then 64kbps, then 12kbps
        return downloadUrlArray.find(dl => dl.quality === '320kbps')?.link ||
               downloadUrlArray.find(dl => dl.quality === '160kbps')?.link ||
               downloadUrlArray.find(dl => dl.quality === '128kbps')?.link ||
               downloadUrlArray.find(dl => dl.quality === '64kbps')?.link ||
               downloadUrlArray[0]?.link || '';
    };


    // Saavn specific data mapping and normalization
    if (type === 'tracks') {
        newItem.title = data.name;
        newItem.artist = { name: data.primaryArtists, id: data.artistMap?.artists?.[0]?.id || data.primaryArtists }; // Assuming primaryArtists is a string
        newItem.album = { title: data.album?.name, id: data.album?.id, cover_small: data.image?.[0]?.link, cover_medium: data.image?.[1]?.link, cover_big: data.image?.[2]?.link, cover_xl: data.image?.[2]?.link };
        newItem.duration = data.duration;
        newItem.explicit_lyrics = data.explicitContent === 1;
        newItem.downloadUrl = data.downloadUrl; // Keep original array for download functionality
        newItem.streamUrl = getHighestQualityStreamUrl(data.downloadUrl); // New property for player source
        newItem.image = getHighestQualityImage(data.image); // Normalize image to a single URL
        newItem.language = data.language; // Add language field for tracks
    } else if (type === 'albums') {
        newItem.title = data.name;
        newItem.artist = { name: data.primaryArtists, id: data.artistMap?.artists?.[0]?.id || data.primaryArtists };
        newItem.image = getHighestQualityImage(data.image); // Normalize image to a single URL
        newItem.release_date = data.year; // Saavn provides year, not full date
    } else if (type === 'artists') {
        newItem.name = data.name;
        newItem.image = getHighestQualityImage(data.image); // Normalize image to a single URL
        newItem.followerCount = data.followerCount; // Add follower count for artists
    } else if (type === 'genres') {
        newItem.name = data.name;
        newItem.image = getHighestQualityImage(data.image); // Normalize image to a single URL
    } else if (type === 'radios') {
        newItem.title = data.name;
        newItem.image = getHighestQualityImage(data.image); // Normalize image to a single URL
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

function handleLanguageFilter(item) { // NEW function
    if (languageFilterValue && dataType === 'tracks') {
        // Assuming 'language' field exists for tracks
        return item.language?.toLowerCase() === languageFilterValue.toLowerCase();
    }
    return true;
}

function addFavoriteAndBlacklist(item) {
    // Use getSingleData to ensure proper mapping and normalization for all item types
    return getSingleData({ type: dataType, data: item });
};