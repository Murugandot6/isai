import { playPause, prevSong, nextSong, setActiveSong, setAlbum, stop, shuffleOn, shuffleOff, setRepeat, addToUpNext, incrementShuffleLanguageIndex } from "../redux/features/playerSlice"
import { store } from '../redux/store';
import { displayMessage } from "./prompt"
import { fetchTrendingSongsByLanguage } from "./fetchData";

export function play() {
    store.dispatch(playPause(true));
    displayMessage('Playing song.');
}

export function pause () {
    store.dispatch(playPause(false));
    displayMessage('Song paused.');
}

export function next (i) {
    store.dispatch(stop());
    store.dispatch(nextSong(i));
    displayMessage('Playing next song.');
}

export function prev (i) {
    store.dispatch(stop());
    store.dispatch(prevSong(i));
    displayMessage('Playing previous song.');
}

export async function onShuffle (isSongPlaying) {
    store.dispatch(shuffleOn(isSongPlaying));
    // No need to increment shuffleLanguageIndex here, as we'll use the global selectedLanguage
    // store.dispatch(incrementShuffleLanguageIndex()); 

    const { selectedLanguage } = store.getState().settings; // Get selected language from settings slice

    displayMessage(`Shuffling with trending ${selectedLanguage} songs.`);

    const trendingSongs = await fetchTrendingSongsByLanguage(selectedLanguage);

    if (trendingSongs.length > 0) {
        const i = Math.floor(Math.random() * trendingSongs.length);
        const song = trendingSongs[i];
        playSongs({ tracks: trendingSongs, song, i });
    } else {
        displayMessage(`Could not find trending ${selectedLanguage} songs. Please try again.`);
        offShuffle();
    }
}

export function offShuffle (silent = false) {
    store.dispatch(shuffleOff())
    if (!silent) {
        displayMessage('Shuffle off.');
    }
}

export function onRepeat () {
    store.dispatch(setRepeat(true))
    displayMessage('Repeat on.');
}

export function offRepeat () {
    store.dispatch(setRepeat(false))
    displayMessage('Repeat off.');
}

export const playSongs = ({ tracks, song, i, album}) => {
    if (!tracks || tracks.length < 1) {
        pause();
        displayMessage('No tracks to play.');
        return;
    }
    // Data is now pre-normalized, so no need to pass library
    store.dispatch(setActiveSong({ tracks, song, i }));
    if (album) store.dispatch(setAlbum(album));
    play();
}

export const playNext = ({ tracks, album }) => {
    store.dispatch(addToUpNext(tracks));
    if (album) store.dispatch(setAlbum(album));
    displayMessage('Added to Queue!');
}