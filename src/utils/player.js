import { playPause, prevSong, nextSong, setActiveSong, setAlbum, stop, shuffleOn, shuffleOff, setRepeat, addToUpNext, incrementShuffleLanguageIndex } from "../redux/features/playerSlice"
import { store } from '../redux/store';
import { displayMessage } from "./prompt"
import { getSingleData, getData } from "./getData"; // Import getSingleData and getData
import { fetchTrendingSongsByLanguage } from "./fetchData"; // Import new fetch function

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
    store.dispatch(shuffleOn(isSongPlaying)); // Keep existing shuffle state
    store.dispatch(incrementShuffleLanguageIndex()); // Increment language index

    const { shuffleLanguageIndex } = store.getState().player;
    const languages = ['English', 'Tamil', 'Hindi']; // Define languages to cycle through
    const selectedLanguage = languages[shuffleLanguageIndex];

    displayMessage(`Shuffling with trending ${selectedLanguage} songs.`);

    const trendingSongs = await fetchTrendingSongsByLanguage(selectedLanguage);

    if (trendingSongs.length > 0) {
        const i = Math.floor(Math.random() * trendingSongs.length);
        const song = trendingSongs[i];
        playSongs({ tracks: trendingSongs, song, i });
    } else {
        displayMessage(`Could not find trending ${selectedLanguage} songs. Please try again.`);
        offShuffle(); // Turn off shuffle if no songs found
    }
}

export function offShuffle () {
    store.dispatch(shuffleOff())
    displayMessage('Shuffle off.');
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
    // Guard clause: Check if tracks is defined and has elements
    if (!tracks || tracks.length < 1) {
        pause();
        displayMessage('No tracks to play.');
        return;
    }

    // Pass raw data; normalization now happens in the Redux slice
    store.dispatch(setActiveSong({ tracks, song, i }));
    if (album) store.dispatch(setAlbum(album));
    play();
}

export const playNext = ({ tracks, album }) => {
    store.dispatch(addToUpNext(tracks));
    if (album) store.dispatch(setAlbum(album));
    displayMessage('Added to Queue!');
}