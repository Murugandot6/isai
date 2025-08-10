const ACCEPTABLE_DATA_TYPES = ['tracks', 'artists', 'albums', 'genres', 'radios'];

// These will be set locally within getData for each call
let ignoreFilter, dataType, filterRgxp, sortValue, languageFilterValue;

export const getData = ({ type, data, noFilter = false, albumFilter = '', sortType = '', languageFilter = '', library }) => {
    if (!ACCEPTABLE_DATA_TYPES.includes(type) || !data) return data;
    
    // Set global-like variables for the current execution context of getData
    ignoreFilter = noFilter;
    dataType = type;
    sortValue = sortType;
    languageFilterValue = languageFilter;

    if (albumFilter) filterRgxp = new RegExp(albumFilter, 'i');
    else filterRgxp = new RegExp('', 'i');

    const newData = data
        .slice()
        .sort(handleSorting)
        .map(item => getSingleData({ type: dataType, data: item, library })) // Pass library down
        .filter(handleFilter)
        .filter(handleLanguageFilter);
    return newData;
}

export const getSingleData = ({ type, data, library }) => {
    if (!ACCEPTABLE_DATA_TYPES.includes(type) || !data) return data;

    // Use the passed library state
    const currentBlacklist = library.blacklist;
    const currentFavorites = library.favorites;
    
    // Set global-like variable for the current execution context of getSingleData
    dataType = type; // Ensure dataType is set for internal use in this function

    const newItem = { ...data };

    // Add favorite and blacklist flags based on the current library state
    newItem.favorite = currentFavorites[dataType]?.map(elem => elem.id).includes(data.id);
    newItem.blacklist = currentBlacklist[dataType]?.map(elem => elem.id).includes(data.id);

    // Saavn specific data mapping
    if (type === 'tracks') {
        newItem.title = data.name;
        newItem.artist = { name: data.primaryArtists, id: data.artistMap?.artists?.[0]?.id || data.primaryArtists };
        newItem.album = { title: data.album?.name, id: data.album?.id, cover_small: data.image?.[0]?.link, cover_medium: data.image?.[1]?.link, cover_big: data.image?.[2]?.link, cover_xl: data.image?.[2]?.link };
        newItem.duration = data.duration;
        newItem.explicit_lyrics = data.explicitContent === 1;
        newItem.language = data.language;

        newItem.image = data.image?.[data.image.length - 1]?.link || '';
        newItem.streamUrl = data.downloadUrl?.[data.downloadUrl.length - 1]?.link || '';
        newItem.downloadUrl = data.downloadUrl;

    } else if (type === 'albums') {
        newItem.title = data.name;
        newItem.artist = { name: data.primaryArtists, id: data.artistMap?.artists?.[0]?.id || data.primaryArtists };
        newItem.cover_medium = data.image?.[1]?.link;
        newItem.cover_xl = data.image?.[2]?.link;
        newItem.release_date = data.year;
        newItem.image = data.image?.[data.image.length - 1]?.link || '';
    } else if (type === 'artists') {
        newItem.name = data.name;
        newItem.picture_medium = data.image?.[1]?.link;
        newItem.picture_xl = data.image?.[2]?.link;
        newItem.image = data.image?.[data.image.length - 1]?.link || '';
        newItem.followerCount = data.followerCount;
    } else if (type === 'genres') {
        newItem.name = data.name;
        newItem.picture_medium = data.image?.[1]?.link;
        newItem.picture_xl = data.image?.[2]?.link;
        newItem.image = data.image?.[data.image.length - 1]?.link || '';
    } else if (type === 'radios') {
        newItem.title = data.name;
        newItem.picture_medium = data.image?.[1]?.link;
        newItem.picture_xl = data.image?.[2]?.link;
        newItem.image = data.image?.[data.image.length - 1]?.link || '';
    }

    if (data.tracks) {
        newItem.tracks = getData({ type: 'tracks', data: data.tracks.data, library }); // Pass library down
    }

    return newItem;
}

function handleSorting(a, b) {
    let sortNumber = 0;

    if (sortValue === 'popular') {
        if (dataType === 'tracks') {
            sortNumber = b.duration - a.duration;
        } else {
            sortNumber = a.name?.localeCompare(b.name);
        }
    } else if (sortValue === 'recent') {
        if (a.year && b.year) {
            sortNumber = b.year - a.year;
        } else {
            sortNumber = a.name?.localeCompare(b.name);
        }
    }

    return sortNumber;
};

function handleFilter(item) {
    const itemInBlacklist = !item.blacklist || ignoreFilter;
    const itemIsAlbumWithRecType = dataType === 'albums' ? filterRgxp.test(item.record_type || '') : true;
    return itemInBlacklist && itemIsAlbumWithRecType;
};

function handleLanguageFilter(item) {
    if (languageFilterValue && dataType === 'tracks') {
        return item.language?.toLowerCase() === languageFilterValue.toLowerCase();
    }
    return true;
}