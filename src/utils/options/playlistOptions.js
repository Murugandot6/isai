import { playSongs, playNext } from "../player"
import { deletePlaylistPrompt } from "../prompt"
import { downloadPlaylistSongs } from "../download" // Import the new download function

export const playlistOptions = [
    {
        name: "Play songs",
        action: ({song, tracks, i}) => playSongs({song, tracks, i})
    },
    {
        name: "Play next",
        action: ({tracks}) => playNext({tracks})
    },
    {
        name: "Download all songs", // New option
        action: ({playlist}) => downloadPlaylistSongs(playlist)
    },
    {
        name: "Edit playlist",
        action: ({playlist}) => `/playlists/${playlist.id}?edit=true`
    },
    {
        name: "Import songs", // New option for importing songs
        action: ({playlist}) => `/playlists/${playlist.id}?edit=true&import=true`
    },
    {
        name: "Delete playlist",
        action: ({playlist}) => deletePlaylistPrompt(playlist)
    },
]